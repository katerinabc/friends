# loop through casts, extract entities and store in clickhouse db
# inputs: list of casts taken from clickhouse db
# accouracy of NER model using F1 score or 

from clickhouse_client import clickhouse_client
from datetime import datetime, timezone
# import pandas
# import nltk
# from nltk.tokenize import word_tokenize, sent_tokenize
# from nltk.corpus import stopwords
# from nltk.stem import WordNetLemmatizer
import string

import spacy

nlp = spacy.load('en_core_web_sm')

client = clickhouse_client()


def query_data(app_user:str):
    # change to streaming for more instant performance 
    # limit 2 for testing. remove later.
    query = "SELECT cast_hash, text FROM casts WHERE app_user = %(app_user)s ORDER BY cast_timestamp DESC"
    print("querying data:", query)
    response = client.query(query, parameters = {'app_user': app_user})

    print("response: ", response.summary)
    return response

def dedupe_entries(entries): # creates a tuples of cast_hash, name, label
    print('Deduping entries...')
    seen = set()
    unique = []
    for e in entries: # e is a dict
        key = (e['cast_hash'], e['name'], e['label'], e['created_at'])
        # print("Key: ", key)
        if key in seen:
            continue
        seen.add(key)
        unique.append(key)
        # print("Unique: ", unique)
    
    return unique

def extract_and_insert_entities(response:dict):
    print("Extracting entities from casts...")
    LABELS = ['ORG', 'GPE', 'LOC', 'MONEY', 'PERSON', 'NORP', 'PRODUCT', 'FAC', 'WORK_OF_ART']

    for data in response.result_rows:
        created_at = datetime.now(timezone.utc)
        hash = data[0]
        
        doc = nlp(data[1]) 

        entities = [
            {'name': ent.text, 'label': ent.label_, 'cast_hash': hash, 'created_at': created_at}
            for ent in doc.ents
            if ent.label_ in LABELS
        ]
        unique_entities = dedupe_entries(entities)
        # print("Unique entities: ", unique_entities)

        #batch insert entities
        
        client.insert(
            'entities',
            unique_entities,
            # [(ent[0], ent[1], ent[2], created_at) for ent in unique_entities],
            column_names=['cast_hash', 'ent_text', 'ent_label', 'created_at']
        )       
        print("Added entity to table. Next cast...")

    client.close_connections() 

# def extract_topic() using LLM integration. 
    # # link topic of casts to user. expertise evaluation later. 


if __name__ == "__main__":
    app_user = '12021' #set from app context
    extract_and_insert_entities(query_data(app_user))