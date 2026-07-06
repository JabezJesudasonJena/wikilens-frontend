Transitioning to semantic search is the right architectural move. Lexical search is fast, but it is fundamentally dumb. It only matches strings. Semantic search uses AI models to convert words into high-dimensional mathematical coordinates (embeddings) so the engine can understand context, synonyms, and intent.

If a user searches *"machine used for browsing the web"*, semantic search maps that sentence to the exact same mathematical neighborhood as the word *"Computer"*.

Here is the direct, unvarnished reality of this upgrade: **you have to tear down a piece of what you just built.** Standard PostgreSQL cannot do semantic search. You must upgrade your database infrastructure, and you must introduce a machine learning pipeline into your Node.js code.

Here is the exact three-step roadmap to make this transition.

### Phase 1: The Database Upgrade (`pgvector`)

You cannot use standard PostgreSQL anymore. You must swap your Docker database image to one that has the `pgvector` extension compiled into it. This extension allows PostgreSQL to store and calculate distances between AI embeddings (arrays of hundreds of decimal numbers).

* **The Action:** We will update your `docker-compose.yml` to use the `pgvector/pgvector:pg15` image. This will require wiping your current 385 articles and starting fresh.

### Phase 2: The Embedding Engine (`Transformers.js`)

Right now, your worker just saves raw text. Going forward, your worker must pass the Wikipedia text through an AI model to generate a Vector Embedding before saving it.

* **The Action:** We will install `@xenova/transformers` in your Node environment. This runs a lightweight, open-source AI model (`all-MiniLM-L6-v2`) entirely locally on your machine. It is 100% free, requires no OpenAI API keys, and outputs a 384-dimension vector for every article.

### Phase 3: The Vector API (`server.js`)

Your Express server will change completely. When a user searches *"what is computer"*, the API will first pass that query through the exact same AI model to get its 384-dimension vector.

* **The Action:** We will rewrite the Prisma SQL query to use Cosine Similarity (`<=>`). Instead of asking PostgreSQL, *"Does this word exist?"*, it will ask, *"Which articles have vectors that are mathematically closest to the user's vector?"*

To proceed, we must wipe your current PostgreSQL container and replace it with the `pgvector` version. Are you ready to modify your `docker-compose.yml` and reset the database to begin the upgrade?