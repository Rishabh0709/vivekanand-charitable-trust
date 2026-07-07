#!/bin/bash

# Adds empty Jekyll front matter (---\n---\n) to the top of every .html file
# that doesn't already have it. Safe to re-run — skips files already done.

count_added=0
count_skipped=0

find . -name "*.html" -not -path "./.git/*" | while read -r file; do
  first_line=$(head -n 1 "$file")
  
  if [ "$first_line" == "---" ]; then
    echo "SKIP (already has front matter): $file"
    count_skipped=$((count_skipped + 1))
  else
    # Create temp file with front matter + original content
    { echo "---"; echo "---"; echo ""; cat "$file"; } > "${file}.tmp"
    mv "${file}.tmp" "$file"
    echo "ADDED front matter: $file"
    count_added=$((count_added + 1))
  fi
done

echo ""
echo "Done. Check the output above for details."