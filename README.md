# prp
password reverse proxy with self-generating TLS

Useful to put a basic auth in front of a website, e.g. for the RethinkDB admin interface.

## Install

```npm i -g prp```

## Usage

prp -c config.json

## Config

```
{
    "username": "test",
    "password": "test",
    "port": 7000,
    "target": "http://www.yahoo.com"
}
```


