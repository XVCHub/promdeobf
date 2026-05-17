export default {
    async fetch(req) {
        if (req.method !== "POST" || new URL(req.url).pathname !== "/deobfuscate")
            return new Response("not found", { status: 404 });

        const { source } = await req.json();
        if (!source) return Response.json({ error: "no source" }, { status: 400 });

        let tries = 0;
        while (tries < 5) {
            tries++;
            const res = await fetch("https://relua.lua.cz/deobfuscate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename: "25ms.lua", source, lua_version: "Lua51", pretty: true })
            });

            const data = await res.json();

            if (data.output) return Response.json({ output: data.output });
            if (data.retry_after) { await new Promise(r => setTimeout(r, data.retry_after * 1000)); continue; }
            return Response.json({ error: "not_prometheus" });
        }

        return Response.json({ error: "max_retries" }, { status: 500 });
    }
};
