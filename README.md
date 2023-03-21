# media-uploader

A simple media uploader and proxy for Nostr.

Deployed on Cloudflare Workers.

## Usage

POST/PUT file directly:

```
curl -X POST -T path/to/file example.com

curl -T path/to/file example.com
```

Custom filename and mimetype:

```
curl -T path/to/file -H x-filename:filename -H x-mime-type:image/jpeg example.com
```

Respond file url in plain text.
This url default has 1 year cache control.

## Build and deploy

Build:

```
npm start
```

Deploy:

```
npm run deploy
```

## Ref

Thanks following services provide hosting:

- nostr.build
- void.cat
- member.cash
- pomf2.lain.la
- nostrimg.com
