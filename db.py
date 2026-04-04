import psycopg2
from dotenv import load_dotenv
import os
import helpers

# Load environment variables from .env
load_dotenv()

from psycopg2 import pool

# Parse DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL")

try:
    db_pool = psycopg2.pool.ThreadedConnectionPool(
        1, 20,
        DATABASE_URL,
        connect_timeout=10
    )
except psycopg2.Error as e:
    print(f"[ERROR] Failed to initialize Database Pool: {e}")
    db_pool = None

def get_db_connection():
    """Get a PostgreSQL database connection from the pool"""
    try:
        if db_pool:
            return db_pool.getconn()
        return None
    except Exception as e:
        print(f"[ERROR] Failed to get connection from pool: {e}")
        return None

def release_db_connection(conn):
    """Return the database connection to the pool"""
    if db_pool and conn:
        db_pool.putconn(conn)

def init_db():
    """Initialize the database and create the scores table if it doesn't exist"""
    try:
        conn = get_db_connection()
        if conn is None:
            return False
        cur = conn.cursor()
        
        # Create table if it doesn't exist
        cur.execute("""
            CREATE TABLE IF NOT EXISTS scores (
                id TEXT,
                secret TEXT,
                name TEXT,
                country TEXT,
                score REAL,
                software TEXT,
                test_selected TEXT,
                timestamp REAL,
                PRIMARY KEY (id,test_selected)
            )
        """)
        conn.commit()
        cur.close()
        release_db_connection(conn)
        return True
    except Exception as e:
        print(f"Failed to initialize database: {e}")
        return False

def register_player(player_id, secret_token, name, country, score, software, selected_test, timestamp):
    """Register a new player in the database"""
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return "Failed to connect to database"
        
        cur = conn.cursor()
        
        # Check if player id already in database
        cur.execute("SELECT id FROM scores WHERE id = %s", (player_id,))
        if cur.fetchone():
            return "Player already registered"
        
        # Insert new player
        cur.execute("""
            INSERT INTO scores(id, secret, name, country, score, software, test_selected, timestamp) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (player_id, secret_token, name, country, score, software, selected_test, timestamp))
        
        conn.commit()
        return 1
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error registering player: {e}")
        return e
    finally:
        if conn:
            cur.close()
            release_db_connection(conn)

def get_player_info(secret_key):
    """Get player ID from secret key"""
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return None
        
        cur = conn.cursor()
        cur.execute("SELECT id FROM scores WHERE secret = %s", (secret_key,))
        player_id = cur.fetchone()
        return player_id
    except Exception as e:
        print(f"Error getting player info: {e}")
        return None
    finally:
        if conn:
            cur.close()
            release_db_connection(conn)
        
# def insert_into_db(player_id, secret_token, name, country, score, software, selected_test, timestamp):
#     """Insert a new score record into the database"""
#     conn = None
#     try:
#         conn = get_db_connection()
#         if conn is None:
#             return "Failed to connect to database"
        
#         cur = conn.cursor()
#         user_score_data = (player_id, secret_token, name, country, score, software, selected_test, timestamp)
#         cur.execute("""
#             INSERT INTO scores(id, secret, name, country, score, software, test_selected, timestamp) 
#             VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
#         """, user_score_data)
        
#         conn.commit()
#         return 1
#     except Exception as e:
#         if conn:
#             conn.rollback()
#         print(f"Error inserting into database: {e}")
#         return e
#     finally:
#         if conn:
#             cur.close()
#             release_db_connection(conn)

def update_user_score(user_id, test_type, software, timestamp, new_score):
    """Update or insert a score for a user"""
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return "Failed to connect to database"
        
        cur = conn.cursor()
        
        # Get existing user data
        cur.execute("SELECT * FROM scores WHERE id = %s", (user_id,))
        data = cur.fetchone()
        
        if not data:
            return "User not found"
        
        # Check if test type is different
        if data[6] != test_type:  # data[6] is test_selected column
            cur.execute("""
                INSERT INTO scores(id, secret, name, country, score, software, test_selected, timestamp) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (data[0], data[1], data[2], data[3], new_score, software, test_type, timestamp))
        else:
            cur.execute("""
                UPDATE scores SET score = %s, timestamp = %s, software = %s 
                WHERE id = %s AND test_selected = %s
            """, (new_score, timestamp, software, user_id, test_type))
        
        conn.commit()
        return 1
    except ValueError as e:
        if conn:
            conn.rollback()
        print(f"ValueError in update_user_score: {e}")
        return [e, "user ID and userName do not match"]
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error updating user score: {e}")
        return [e, "Score update failed"]
    finally:
        if conn:
            cur.close()
            release_db_connection(conn)

def get_top_10(test_type: str):
    """Get top 10 players for a specific test type"""
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return "Failed to connect to database"
        
        cur = conn.cursor()
        ascending_mode = ["Scriptures 10", "Scriptures 20", "10", "20"]
        
        if test_type in ascending_mode:
            cur.execute(
                "SELECT id, name, country, score, software FROM scores WHERE test_selected = %s ORDER BY score, timestamp LIMIT 10",
                (test_type,)
            )
        else:
            cur.execute(
                "SELECT id, name, country, score, software FROM scores WHERE test_selected = %s ORDER BY score DESC, timestamp ASC LIMIT 10",
                (test_type,)
            )
        
        top10 = cur.fetchall()
        top10_with_flags = [
            (id, name, helpers.get_country_code(country), score, software, country)
            for id, name, country, score, software in top10
        ]
        return top10_with_flags
    except Exception as e:
        print(f"Failed to fetch top 10: {e}")
        return "Failed to Fetch: " + str(e)
    finally:
        if conn:
            cur.close()
            release_db_connection(conn)
def get_player_position_info(test_type: str, player_id: str):
    """Get player's rank and info for a specific test"""
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return None
        
        cur = conn.cursor()
        ascending_mode = ["Scriptures 10", "Scriptures 20", "10", "20", "Scripture 10", "Scripture 20"]
        
        if test_type in ascending_mode:
            cur.execute("""
                SELECT rank, id, name, country, score, software FROM (
                    SELECT id, name, country, score, software, 
                           RANK() OVER (ORDER BY score, timestamp) AS rank
                    FROM scores
                    WHERE test_selected = %s
                ) subquery WHERE id = %s
            """, (test_type, player_id))
        else:
            cur.execute("""
                SELECT rank, id, name, country, score, software FROM (
                    SELECT id, name, country, score, software, 
                           RANK() OVER (ORDER BY score DESC, timestamp ASC) AS rank
                    FROM scores
                    WHERE test_selected = %s
                ) subquery WHERE id = %s
            """, (test_type, player_id))
        
        player_rank = cur.fetchone()
        
        if not player_rank:
            return None
        
        rank, id, name, country, score, software = player_rank
        country_code = helpers.get_country_code(country)
        player_rank_with_name = (rank, id, name, country_code, score, software, country)
        return player_rank_with_name
    except Exception as e:
        print(f"Error in get_player_position_info: {e}")
        return None
    finally:
        if conn:
            cur.close()
            release_db_connection(conn)
