// src/dummyData.js
// Bentuk data ini SAMA PERSIS dengan response backend sungguhan
// Jadi nanti waktu disambungkan ke backend, tidak perlu ubah apapun

// Ini hasil dari /api/scrape
export const dummyScrape = {
  success: true,
  maxDepth: 1,
  domTree: {
    id: "html",
    tag: "html",
    attributes: {},
    depth: 0,
    children: [
      {
        id: "html/head",
        tag: "head",
        attributes: {},
        depth: 1,
        children: [
          {
            id: "html/head/title",
            tag: "title",
            attributes: {},
            depth: 2,
            innerText: "Halaman Contoh",
            children: [],
          },
        ],
      },
      {
        id: "html/body",
        tag: "body",
        attributes: {},
        depth: 1,
        children: [
          {
            id: "html/body/div[0]",
            tag: "div",
            attributes: { class: "container", id: "main" },
            depth: 2,
            children: [
              {
                id: "html/body/div[0]/h1",
                tag: "h1",
                attributes: { class: "judul" },
                depth: 3,
                innerText: "Selamat Datang",
                children: [],
              },
              {
                id: "html/body/div[0]/p[0]",
                tag: "p",
                attributes: { class: "teks" },
                depth: 3,
                innerText: "Ini paragraf pertama.",
                children: [],
              },
              {
                id: "html/body/div[0]/p[1]",
                tag: "p",
                attributes: { class: "teks" },
                depth: 3,
                innerText: "Ini paragraf kedua.",
                children: [],
              },
            ],
          },
          {
            id: "html/body/div[1]",
            tag: "div",
            attributes: { class: "footer" },
            depth: 2,
            children: [
              {
                id: "html/body/div[1]/span",
                tag: "span",
                attributes: {},
                depth: 3,
                innerText: "Footer teks",
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
};

// Ini hasil dari /api/search
// Contoh ini: mencari selector "p" pakai BFS
// hasilnya: dua elemen <p> ditemukan
export const dummySearch = {
  results: [
  ],
  stats: {
    timeMs: 12,
    nodesVisited: 9,
  },
  traversalLog: [
    { step: 1,  nodeId: "html",                  tag: "html",  action: "visit", depth: 0 },
    { step: 2,  nodeId: "html/head",              tag: "head",  action: "visit", depth: 1 },
    { step: 3,  nodeId: "html/head/title",        tag: "title", action: "skip",  depth: 2 },
    { step: 4,  nodeId: "html/body",              tag: "body",  action: "visit", depth: 1 },
    { step: 5,  nodeId: "html/body/div[0]",       tag: "div",   action: "visit", depth: 2 },
    { step: 6,  nodeId: "html/body/div[0]/h1",    tag: "h1",    action: "skip",  depth: 3 },
    { step: 7,  nodeId: "html/body/div[0]/p[0]",  tag: "p",     action: "match", depth: 3 },
    { step: 8,  nodeId: "html/body/div[0]/p[1]",  tag: "p",     action: "skip", depth: 3 },
    { step: 9,  nodeId: "html/body/div[1]",       tag: "div",   action: "skip", depth: 2 },
    { step: 10, nodeId: "html/body/div[1]/span",  tag: "span",  action: "skip",  depth: 3 },
  ],
};