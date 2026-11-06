# FractiSI Multi-Agent — self-hosted Workstation image (CLI + platform library)
FROM node:22-bookworm-slim
WORKDIR /opt/fractisi
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json ./
COPY scripts ./scripts
COPY src ./src
COPY tiny-footprint ./tiny-footprint
COPY fractisi ./fractisi
COPY docs ./docs
COPY benchmarks ./benchmarks
COPY workloads ./workloads
COPY research ./research
COPY product ./product
COPY QUICKSTART.md README.md ./
ENV NODE_ENV=production
ENTRYPOINT ["node", "scripts/tiny.mjs"]
CMD ["doctor"]
