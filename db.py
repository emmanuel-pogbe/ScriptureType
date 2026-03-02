import sqlite3 
import helpers

def register_player(player_id,secret_token,name,country,score,software,selected_test,timestamp):
    try:
        db = sqlite3.connect("score_info.db")
        c = db.cursor()
        #Check if player id already in database
        c.execute("SELECT id from scores WHERE id = ?",(player_id,))
        if c.fetchone():
            return "Player already registered"
        c.execute("""
            INSERT INTO scores(id,secret,name,country,score,software,test_selected,timestamp) VALUES (?,?,?,?,?,?,?,?)
        """,(player_id,secret_token,name,country,score,software,selected_test,timestamp))
        db.commit()
        db.close()
        return 1
    except Exception as e:
        try:
            db.close()
        except Exception as e:
            print(e)
        finally:    
            return e
    finally:
        db.close()

def get_player_info(secret_key):
    try:
        db = sqlite3.connect("score_info.db")
        c = db.cursor()
        c.execute("SELECT id FROM scores WHERE secret = ?",(secret_key,))
        player_id = c.fetchone()
        db.close()
        return player_id
    except Exception as e:
        return None
    finally:
        db.close()
        
def insert_into_db(player_id,secret_token,name,country,score,software,selected_test,timestamp):
    try:
        db = sqlite3.connect("score_info.db")
        c = db.cursor()
        user_score_data = (player_id,secret_token,name,country,score,software,selected_test,timestamp)
        c.execute("""
            INSERT INTO scores(user_id,secret,name,country,score,software,test_selected,timestamp) VALUES (?,?,?,?,?)
        """,user_score_data)
        db.commit()
        db.close()
        return 1
    except Exception as e:
        try:
            db.close()
        except Exception as e:
            print(e)
        finally:    
            return e
    finally:
        db.close()
def update_user_score(user_id, test_type, software, timestamp, new_score):
    try:
        db = sqlite3.connect("score_info.db")
        c = db.cursor()
        c.execute("SELECT * FROM scores WHERE id = ?",(user_id,))
        data = c.fetchone()
        if data[6] != test_type:
            c.execute("""
                INSERT INTO scores(id, secret, name, country, score, software, test_selected, timestamp) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (data[0], data[1], data[2], data[3], new_score, software, test_type, timestamp))
        else:
            c.execute("UPDATE scores SET score = ?, timestamp = ?, software = ? WHERE id = ? AND test_selected=?",(new_score,timestamp,software,user_id,test_type))
        db.commit()
        db.close()
        return 1
    except ValueError as e:
        print(e)
        return [e,"user ID and userName do not match"]
    except Exception as e:
        print(e)
        return [e,"Score update failed"]
    finally:
        db.close()

def get_top_10(test_type: str):
    ascending_mode = ["Scriptures 10", "Scriptures 20","10","20"]
    try:
        db = sqlite3.connect("score_info.db")
        c = db.cursor()
        if test_type in ascending_mode:
            c.execute("SELECT id,name,country,score,software FROM scores WHERE test_selected = ? ORDER BY score,timestamp LIMIT 10",(test_type,))
        else:
            c.execute("SELECT id,name,country,score,software FROM scores WHERE test_selected = ? ORDER BY score DESC, timestamp ASC LIMIT 10",(test_type,))
        top10 = c.fetchall()
        top10_with_flags = [
            (id,name,helpers.get_country_code(country),score,software,country)
            for id,name,country,score,software in top10
        ]
        return top10_with_flags
    except Exception as e: 
        return "Failed to Fetch" + str(e)
    finally:
        db.close()
def get_player_position_info(test_type: str, player_id: str):
    try:
        db = sqlite3.connect("score_info.db")
        c = db.cursor()
        ascending_mode = ["Scriptures 10", "Scriptures 20","10","20","Scripture 10","Scripture 20"]
        if test_type in ascending_mode:
            c.execute("""
                    SELECT rank,id,name,country,score,software FROM (
                        SELECT id,name,country,score,software, RANK() OVER (
                            ORDER BY score, timestamp
                        ) AS rank
                        FROM scores
                        WHERE test_selected = ?
                    ) WHERE id = ?
                """, (test_type, player_id))
        else:
            c.execute("""
                    SELECT rank,id,name,country,score,software FROM (
                        SELECT id,name,country,score,software, RANK() OVER (
                            ORDER BY score DESC, timestamp ASC
                        ) AS rank
                        FROM scores
                        WHERE test_selected = ?
                    ) WHERE id = ?
                """, (test_type, player_id))
        player_rank = c.fetchone()
        if not player_rank:
            return None
        rank,id,name,country,score,software = player_rank
        country_code = helpers.get_country_code(country)
        player_rank_with_name = (rank,id,name,country_code,score,software,country)
        return player_rank_with_name
    except Exception as e:
        print(f"Error in get_player_position_info: {e}")
        return None
    finally:
        db.close()

if __name__ == "__main__":
    db = sqlite3.connect("score_info.db")
    c = db.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS scores (
            id TEXT PRIMARY KEY,
            secret TEXT,
            name TEXT,
            country TEXT,
            score REAL,
            software TEXT,
            test_selected TEXT,
            timestamp REAL
            )
    """)
    # c.execute("DROP TABLE scores")
    db.commit()
    db.close()
    # top_10 = get_top_10("30s")
    # for user in top_10:
    #     for entry in user:
    #         print(entry,end=" ")
    #     print()
    player1 = get_player_position_info("30s", "562789")
    print(player1)
