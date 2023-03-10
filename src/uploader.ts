import mime from "mime/lite"

function makeFile(blob: Blob, name: string | null, t: string | null) {
    const fname = name || crypto.randomUUID().replaceAll("-", "")
    const type = t || mime.getType(fname) || "image/jpeg"
    return new File([blob], fname, { type })
}

export async function nostrBuildUpload(blob: Blob, name: string | null, t: string | null) {
    const file = makeFile(blob, name, t)
    const body = new FormData()
    body.append("fileToUpload", file)
    const res = await fetch("https://nostr.build/upload.php", {
        method: "POST",
        body,
    })
    console.log(res.status)
    const html = await res.text()
    const url = html.match(/https\:\/\/nostr\.build\/i\/nostr.build_.*?\.[a-z0-9]*/)
    return url ? url[0] : ""
}

export async function voidCatUpload(blob: Blob, name: string | null, t: string | null) {
    const file = makeFile(blob, name, t)
    const buffer = await file.arrayBuffer()
    const hash = await crypto.subtle.digest("SHA-256", buffer)
    const res = await fetch("https://void.cat/upload?cli=true", {
        method: "POST",
        headers: {
            "v-content-type": file.type,
            "v-filename": file.name,
            "v-full-digest": [...new Uint8Array(hash)].map(i => i.toString(16).padStart(2, '0')).join(""),
        },
        body: buffer,
    })
    const url = new URL(await res.text())
    url.protocol = "https://"
    return url.href
}

export async function memberCashUpload(blob: Blob, name: string | null, t: string | null) {
    const file = makeFile(blob, name, t)
    const body = new FormData()
    body.append("firstfile", file)
    const res = await fetch("https://member.cash/v2/uploadfile", {
        method: "POST",
        body,
    })
    const json = await res.json() as Record<string, string>
    return json.memberurl
}

export async function lainLaUpload(blob: Blob, name: string | null, t: string | null) {
    const file = makeFile(blob, name, t)
    const body = new FormData()
    body.append("files[]", file)
    const res = await fetch("https://pomf2.lain.la/upload.php", {
        method: "POST",
        body,
    })
    const json = await res.json() as { files: { url: string }[] }
    return json.files[0].url
}