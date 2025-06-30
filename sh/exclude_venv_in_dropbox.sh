find `pwd` -type d -regex ".*\(venv\|temp\|tmp\)$" -prune -exec ~/bin/dropbox.py exclude add {} \;
