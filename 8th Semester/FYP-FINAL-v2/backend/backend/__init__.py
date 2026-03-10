"""Django project bootstrap tweaks."""

# Use PyMySQL as MySQLdb backend to avoid system-level MySQL client build deps.
try:  # pragma: no cover
    import pymysql

    pymysql.install_as_MySQLdb()
except Exception:
    # If PyMySQL is not installed yet, Django will raise a clearer error on startup.
    pass
