#!/usr/bin/env python

# fetching 25 casts via neynar using fid passed from miniapp.
# 25 is default, no pagination and ensures we should have 10 with more than 150 characteres
# filter to only keep those with text length > 150
# save to clickhouse db

import os
import sys
from dotenv import load_dotenv
import requests
import clickhouse_connect
import json
from typing import List, Dict
from datetime import datetime, timezone
from clickhouse_client import clickhouse_client

# Load .env file
load_dotenv('.env')

# fetching casts from Neynar
def fetch_casts(fid: str):
    print('starting to fetch casts for fid: ', fid)
    # get neynar api key from environment variables
    neynar_api_key = os.getenv('NEYNAR_API_KEY')
    if not neynar_api_key:
        raise ValueError('neynar api key not found in env variables')

    #fetch casts from Neynar
    url = "https://api.neynar.com/v2/farcaster/feed/following/"
    querystring = {
        "with_recasts": "true",
        "limit": 25,
        "fid": fid
        }
    headers = {"x-api-key": neynar_api_key}

    response = requests.get(url, headers=headers, params=querystring)

    print('neynar response: ', response.headers)
    # print('casts: ', response.json().get('casts'))

    return response.json()

def parse_and_insert(raw_response: dict, fid: str):
    print('starting to parse and insert casts for fid: ', fid)
    app_user = fid

    client = clickhouse_client()
    print("connected to client")

    # parse the data
    parsed_casts = []
    casts = raw_response.get('casts', []) #get casts array from response and add default emtpy list

    i = 0 # counter of casts with text length < 150
    for c in casts:
        if len(c.get('text')) < 150:
            i += 1
            continue

        cast_hash = c.get('hash')
        fid = c.get('author',{}).get('fid')
        username = c.get('author',{}).get('username')
        text = c.get('text')
        cast_timestamp = datetime.fromisoformat(c.get('timestamp').replace('Z', '+00:00'))  # make a timezone-aware datetime
        ingested_at = datetime.now()
        app_user = app_user 
        data = [cast_hash, fid, username, text, cast_timestamp, ingested_at, app_user]
        print("cast: ", data)

        client.insert('casts', [data], column_names=['cast_hash', 'fid',  'username', 'text',  'cast_timestamp', 'ingested_at', 'app_user'])
        print("casts skipped: ", i)
        print("cast saved to clickhouse ", cast_hash)

        client.close_connections() 

def parse_casts(raw_response: dict) -> List[Dict]:
    parsed_casts = []
    casts = raw_response.get('casts', []) #get casts array from response and add default emtpy list

    for c in casts:
        hash = c.get('hash')
        text = c.get('text')
        fid = c.get('author',{}).get('fid')
        username = c.get('author',{}).get('username')
        timestamp = c.get('timestamp')
        ingested_at = datetime.now(timezone.utc) 
    
        parsed_casts.append({
            'cast_hash': hash,
            'fid': fid,
            'username': username,
            'text': text,
            'cast_timestamp': timestamp,
            'ingested_at': ingested_at
        })

    return parsed_casts
    
def filter_casts(casts: dict):
    # filter to only keep those with text length > 150
    filtered = [cast for cast in casts if len(cast['text']) > 150]
    removed = len(casts) - len(filtered)
    print("removed ", removed, " casts.")
    
    return filtered

def save_casts_to_clickhouse(casts: list):
    # save to clickhouse db
    client = clickhouse_client()
    print("conencted to " + CLICKHOUSE_CLOUD_HOSTNAME + "\n")

    print("casts: ", casts)

    # add data
    if casts:
        #insert casts in bulk
        client.insert('casts', casts, column_names=casts[0].keys())
        print(f"saved {len(casts)} casts to clickhouse.")

    # # add data
    # for cast in casts:
    #     client.insert('casts', cast, column_names=cast.keys())
    #     print("cast saved to clickhouse ", cast['cast_hash'])

    client.close_connections() # close connection 


if __name__ == "__main__":
    fid = sys.argv[1] if len(sys.argv) > 1 else "12021" # this should come from nextjs app context later on
    raw = fetch_casts(fid)
    parse_and_insert(raw, fid)
    # parsed = parse_casts(raw)
    # filtered = filter_casts(parsed)
    # save_casts_to_clickhouse(filtered)
