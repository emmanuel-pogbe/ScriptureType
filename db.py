import sqlite3 
import helpers

def insert_into_db(user_score_data: tuple):
    try:
        db = sqlite3.connect("score_info.db")
        c = db.cursor()
        c.execute("""
            INSERT INTO scores(name,country,score,software,text_selected) VALUES (?,?,?,?,?)
        """,user_score_data)
        return 1
    except Exception as e:
        return e
    finally:
        db.close()

def get_top_10(test_type: str):
    ascending_mode = ["Scripture 10", "Scripture 20","10","20"]
    try:
        db = sqlite3.connect("score_info.db")
        c = db.cursor()
        if test_type in ascending_mode:
            c.execute("SELECT name,country,score,software FROM scores WHERE test_selected = ? ORDER BY score,timestamp LIMIT 10",(test_type,))
        else:
            c.execute("SELECT name,country,score,software FROM scores WHERE test_selected = ? ORDER BY score DESC, timestamp ASC LIMIT 10",(test_type,))
        top10 = c.fetchall()
        top10_with_flags = [
            (name,helpers.country_code_to_flag(country),score,software)
            for name,country,score,software in top10
        ]
        return top10_with_flags
    except Exception as e: 
        return "Failed to Fetch" + str(e)
def get_player_position_info(test_type: str, player_id: str):
    try:
        db = sqlite3.connect("score_info.db")
        c = db.cursor()
        ascending_mode = ["Scripture 10", "Scripture 20","10","20"]
        if test_type in ascending_mode:
            c.execute("""
                    SELECT rank,name,country,score,software FROM (
                        SELECT id,name,country,score,software, RANK() OVER (
                            ORDER BY score, timestamp
                        ) AS rank
                        FROM scores
                        WHERE test_selected = ?
                    ) WHERE id = ?
                """, (test_type, player_id))
        else:
            c.execute("""
                    SELECT rank,name,country,score,software FROM (
                        SELECT id,name,country,score,software, RANK() OVER (
                            ORDER BY score DESC, timestamp ASC
                        ) AS rank
                        FROM scores
                        WHERE test_selected = ?
                    ) WHERE id = ?
                """, (test_type, player_id))
        player_rank = c.fetchone()
        #Get the flag representation of the country user is in
        rank,name,country,score,software = player_rank
        country_flag = helpers.country_code_to_flag(country)
        player_rank_with_flag = (rank,name,country_flag,score,software)
        return player_rank_with_flag
    except Exception as e:
        return "Failed to Fetch" + str(e)

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
    #(id, secret, name, country, score, software, test_selected, timestamp)
    # dummy_data = [
    # ("543111","334040qd05","Ife","EG",1.5,"EasyWorship","10",1768043265),
    # ("821456","7f3k2m9x1q","Luke","RU",1.7,"VideoPsalm","10",1768043280),
    # ("562789","9p8w4c5r2l","Patrick","US",11,"BibleShow","30s",1768043295),
    # ("441923","3d7n1v8h6t","Lakewood","CA",16,"EasyWorship","30s",1768043310),
    # ("695234","5j2s6b4w9e","Winder","MG",2.6,"VideoPsalm","20",1768043325),
    # ("738651","8k9f3x1c5o","Maria","IT",2.5,"EasyWorship","10",1768043340),
    # ("482917","6m4p7d2j9u","Ahmed","EG",14,"VideoPsalm","30s",1768043355),
    # ("614352","2h8y5n3g7a","Sofia","GR",1.9,"BibleShow","10",1768043370),
    # ("759284","4r1k9m6w2b","David","CA",15,"EasyWorship","30s",1768043385),
    # ("325671","7v3t8q1p5c","Lisa","DE",3.3,"VideoPsalm","20",1768043400),
    # ("847329","9x2f6s4e1w","James","GB",2.4,"BibleShow","10",1768043415),
    # ("514768","5l7d3m8k2h","Emma","AU",1.7,"EasyWorship","20",1768043430),
    # ("682145","3n9o4c1f7r","Carlos","MX",13,"VideoPsalm","30s",1768043445),
    # ("729356","8u2j6g5t1p","Anna","PL",16,"BibleShow","30s",1768043460),
    # ("461928","6e4w9b2x3s","Michael","US",2.6,"EasyWorship","20",1768043475),
    # ]
    # c.executemany("""
    # INSERT INTO scores VALUES (?,?,?,?,?,?,?,?)
    # """,dummy_data)


    # c.execute("DROP TABLE scores")
    db.commit()
    db.close()

    # top_10 = get_top_10("30s")
    # for user in top_10:
    #     for entry in user:
    #         print(entry,end=" ")
    #     print()
    # player1 = get_player_position_info("30s", "562789")
    # print(player1)
