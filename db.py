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

def get_top_10(test_type: str):
    ascending_mode = ["Scripture 10", "Scripture 20","10","20"]
    try:
        db = sqlite3.connect("score_info.db")
        c = db.cursor()
        if test_type in ascending_mode:
            c.execute("SELECT * FROM scores WHERE test_selected = ? ORDER BY score LIMIT 10",(test_type,))
        else:
            c.execute("SELECT * FROM scores WHERE test_selected = ? ORDER BY score DESC LIMIT 10",(test_type,))
        top10 = c.fetchall()
        return top10
    except:
        return "Failed to Fetch"

if __name__ == "__main__":
    db = sqlite3.connect("score_info.db")
    c = db.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            country TEXT,
            score REAL,
            software TEXT,
            test_selected TEXT
            )
    """)
    # dummy_data = [
    # ("Ife","Egypt",1.5,"EasyWorship","10"),
    # ("Luke","Russia",1.7,"VideoPsalm","10"),
    # ("Patrick","USA",11,"BibleShow","30s"),
    # ("Lakewood","Canada",16,"EasyWorship","30s"),
    # ("Winder","Madagascar",2.6,"VideoPsalm","20"),
    # ("Maria","Italy",2.5,"EasyWorship","10"),
    # ("Ahmed","Egypt",14,"VideoPsalm","30s"),
    # ("Sofia","Greece",1.9,"BibleShow","10"),
    # ("David","Canada",15,"EasyWorship","30s"),
    # ("Lisa","Germany",3.3,"VideoPsalm","20"),
    # ("James","UK",2.4,"BibleShow","10"),
    # ("Emma","Australia",1.7,"EasyWorship","20"),
    # ("Carlos","Mexico",13,"VideoPsalm","30s"),
    # ("Anna","Poland",16,"BibleShow","30s"),
    # ("Michael","USA",2.6,"EasyWorship","20"),
    # ]
    # c.executemany("""
    # INSERT INTO scores(name,country,score,software,test_selected) VALUES (?,?,?,?,?)
    # """,dummy_data)


    # c.execute("DROP TABLE scores")
    db.commit()
    db.close()

    top_10 = get_top_10("20")
    for user in top_10:
        print(user[1],user[2],user[3],user[4],user[5])