import sys
import os
sys.path.insert(0, 'modules')
from flask import Flask
from flask import render_template
import modules.bible as bible
import modules.alias_map as aliasmap
import modules.prefix_map as prefixmap
scripture_data = bible.__bibleverses
bible_books = bible.__biblebooks
prefix_map = prefixmap.__bible_prefix_map
alias_map = aliasmap.__bible_alias_map
app = Flask(__name__,template_folder="templates",static_folder="static")
@app.route("/")
def index():
    return render_template("index.html",scripture_data=scripture_data,bible_books=bible_books,prefix_map=prefix_map,alias_map=alias_map)

@app.route("/leaderboards",methods=["GET"])
def get_leaderboard():
    return render_template("leaderboard.html")
if __name__=="__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run("0.0.0.0",port=port,debug=True)