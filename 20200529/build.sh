#pyinstaller --clean --noconfirm main.py || exit 2
rm -rf dist
pyinstaller main.py --onedir --hidden-import=mavsdk --noconsole
cp -Rf venv/lib/python3.7/site-packages/mavsdk dist/main.app/Contents/MacOS
# rename
mv dist/main.app dist/mini_qgc.app
open dist/mini_qgc.app
