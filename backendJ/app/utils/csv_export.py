import csv
import io
from typing import List, Dict, Any


def generate_csv(headers: List[str], rows: List[List[Any]]) -> str:
    """Menghasilkan representasi string CSV dari list header dan baris data."""
    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)
    writer.writerow(headers)
    for row in rows:
        writer.writerow(row)
    return output.getvalue()
