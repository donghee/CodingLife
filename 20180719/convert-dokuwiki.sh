PROJECT=projects:px4-development
PAGE=commander
pandoc -f org -t dokuwiki $PAGE.org -o $PROJECT:$PAGE.dwiki
pandoc -f org -t docx $PAGE.org -o $PAGE.docx
#open commander with /Applications/HwpMac2014.app
