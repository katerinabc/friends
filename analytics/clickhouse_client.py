import clickhouse_connect
import os
from dotenv import load_dotenv
load_dotenv('.env')

CLICKHOUSE_CLOUD_HOSTNAME = os.getenv('CLICKHOUSE_CLOUD_HOSTNAME')
CLICKHOUSE_CLOUD_USER = os.getenv('CLICKHOUSE_CLOUD_USER')
CLICKHOUSE_CLOUD_PASSWORD = os.getenv('CLICKHOUSE_CLOUD_PASSWORD')

def clickhouse_client():
    client = clickhouse_connect.get_client(
        host = CLICKHOUSE_CLOUD_HOSTNAME,
        port = 8443,
        username = CLICKHOUSE_CLOUD_USER,
        password = CLICKHOUSE_CLOUD_PASSWORD,
        secure = True,
        verify = False #disable SSL verification. fix for production. 
    )

    return client

if __name__ == "__main__":
    client = clickhouse_client()
    print("connected to " + CLICKHOUSE_CLOUD_HOSTNAME + "\n")
    print("client: ", client)