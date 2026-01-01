import sqlite3 
#N.B!!!
#For now, id is auto assigned (auto incremented) - this decision might be reconsidered in the future

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

db = sqlite3.connect("score_info.db")
c = db.cursor()
c.execute("""
    CREATE TABLE IF NOT EXISTS scores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          country TEXT,
          score TEXT,
          software TEXT,
          test_selected TEXT
          )
""")
dummy_data = [
 ("Pogbe","Nigeria","1.6","EasyWorship","10"),
 ("John","New Zealand","1.78","VideoPsalm","10"),
 ("Jerry","Spain","12","BibleShow","30s"),
 ("Paul","Pakistan","15","EasyWorship","30s"),
 ("Prince","Lesotho","2.2","VideoPsalm","20"),
]
c.executemany("""
 INSERT INTO scores(name,country,score,software,test_selected) VALUES (?,?,?,?,?)
""",dummy_data)
db.commit()
db.close()