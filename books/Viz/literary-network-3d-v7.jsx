/**
 * Literary Network 3D — v7 (vault reconstruction)
 *
 * Single-file React + Three.js component. 70 nodes, ~250 edges.
 * Three vertical layers: Layer 0 philosophers (bottom), Layer 1 philosophical
 * fiction (middle), Layer 2 novelists (top). Edge types: genealogy, parallel,
 * tension, divergence, dialogue, reading_path, frontier_link.
 *
 * Features: orbit controls, type-ahead search, edge-type toggles, BFS
 * path-finding between two clicked nodes, grouped connection panel.
 *
 * Note: This file is the vault's reconstruction from the Books5 session.
 * The definitive version is maintained in the React/viz sandbox; edits made
 * there should be propagated here, and vice versa.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ============================================================
// LAYER + EDGE METADATA
// ============================================================

const LAYER_META = {
  0: { label: "Philosopher", color: "#7a9eff", y: -60 },
  1: { label: "Ideas through fiction", color: "#d4b86a", y: 0 },
  2: { label: "Pure novelist", color: "#b674d4", y: 60 },
};

const EDGE_COLORS = {
  genealogy: "#6a9a6a",
  parallel: "#6a8aba",
  tension: "#ba6a6a",
  divergence: "#ba8a6a",
  dialogue: "#d4b86a",
  reading_path: "#888888",
  frontier_link: "#6a6a8a",
};

const EDGE_LABELS = {
  genealogy: "Lineage",
  parallel: "Parallel",
  tension: "Tension",
  divergence: "Divergence",
  dialogue: "Dialogue",
  reading_path: "Reading path",
  frontier_link: "Frontier",
};

// Planar coordinate helper — spreads nodes on the XZ plane at the layer's Y
const t = (x, z) => [x - 400, z - 400];

// ============================================================
// NODES (70)
// ============================================================

const NODES = [
  // ===== LAYER 0 — PHILOSOPHERS =====
  { id: "nietzsche", label: "Nietzsche", layer: 0, pos: t(400, 120), description: "Will to power, eternal recurrence, genealogy of morals. Suffering as constitutive — same diagnosis as Dostoevsky, opposite prescription (self-overcoming vs. transcendence through grace). The dialogue edge's paradigm case." },
  { id: "schopenhauer", label: "Schopenhauer", layer: 0, pos: t(470, 100), description: "The world as will and representation. Pessimism as first philosophy. Nietzsche's departure point; Kundera reads him as the weight to lightness's counterweight." },
  { id: "kierkegaard", label: "Kierkegaard", layer: 0, pos: t(570, 160), description: "Indirect communication; the leap. Absurdity requires irony, not just dread. Kundera inherits the irony-as-method; Camus the absurd-as-condition." },
  { id: "han", label: "Byung-Chul Han", layer: 0, pos: t(130, 140), description: "Self-exploitation through achievement. Burnout society. Transparency as the new kitsch. Dissolution of ritual. Pure-I-It phenomenology." },
  { id: "zizek", label: "Žižek", layer: 0, pos: t(340, 30), description: "Neo-Marxist, Lacanian, Hegelian. Surplus enjoyment — the subject enjoys its own exploitation. Sharp tongue; pop culture as ideology-critique material." },
  { id: "marx", label: "Marx", layer: 0, pos: t(280, 5), description: "Hegel inverted: dialectical materialism. Structural conditions produce predictable outcomes without conspiracy — the ancestor of the sedimentation model." },
  { id: "berlin", label: "Isaiah Berlin", layer: 0, pos: t(620, 30), description: "Liberal pluralism as answer to Enlightenment monism. Two Concepts of Liberty: negative vs. positive freedom. Specifically designed to counter Marx-Hegel-Lenin." },
  { id: "machiavelli", label: "Machiavelli", layer: 0, pos: t(150, 50), description: "The Prince — realpolitik foundation. Power as it IS, not as it should be. Napoleon annotated it as practitioner engaging with theory." },
  { id: "bakunin", label: "Bakunin", layer: 0, pos: t(210, 60), description: "Collectivist anarchism. Split with Marx at the First International (1872) — the foundational left schism of centralized revolution vs. decentralized liberation." },
  { id: "kropotkin", label: "Kropotkin", layer: 0, pos: t(200, 115), description: "Mutual Aid: cooperation, not competition, drives evolution. The anti-Darwinist, anti-Nietzschean position. Anarcho-communism grounded in natural science." },
  { id: "malatesta", label: "Malatesta", layer: 0, pos: t(160, 90), description: "Italian anarchist. Praxis over theory; revolutionary action and organization without authority." },
  { id: "buber", label: "Martin Buber", layer: 0, pos: t(370, 210), description: "I and Thou (1923). Two modes of relation: encounter (Thou) vs. experience (It). Anchor for diagnosing what the digital environment strips." },
  { id: "fisher", label: "Mark Fisher", layer: 0, pos: t(90, 170), description: "Capitalist realism: easier to imagine the end of the world than the end of capitalism. Not an ideology believed — an atmosphere breathed. Depression as political condition." },
  { id: "foucault", label: "Foucault", layer: 0, pos: t(60, 90), description: "Episteme: the unthought conditions of thought. Panopticon internalized — the subject disciplines itself. Fisher's capitalist realism is Foucault's episteme applied to economics." },
  { id: "ingenieros", label: "Ingenieros", layer: 0, pos: t(690, 90), description: "El hombre mediocre. Argentine Nietzscheanism at the turn of the 20th century. Closer to Rand's flattening than Nietzsche's ambiguity, but more honest about aspiration." },
  { id: "jauretche", label: "Jauretche", layer: 0, pos: t(710, 130), description: "Medio pelo: imitation IS the mediocrity. Kundera's kitsch applied to class performance. Argentine critique opposite to Ingenieros's elevation." },

  // ===== LAYER 1 — IDEAS THROUGH FICTION =====
  { id: "dostoevsky", label: "Dostoevsky", layer: 1, pos: t(420, 145), description: "Polyphony; the origin node. The Underground Man, the Grand Inquisitor, Karamazov's fraternal metaphysics. Suffering as constitutive of being human." },
  { id: "tolstoy", label: "Tolstoy", layer: 1, pos: t(250, 65), description: "Philosophy + history in balance. The smoke at Austerlitz — history as chaos, not system. Christian anarchist; Gandhi's correspondent." },
  { id: "hesse", label: "Hesse", layer: 1, pos: t(555, 45), description: "Bridge between Russian depth and Eastern contemplation. Dostoevsky who meditates instead of screams." },
  { id: "sartre", label: "Sartre", layer: 1, pos: t(295, 275), description: "Strips theology, keeps phenomenological core. Nausea — consciousness when meaning collapses. Confronts the absurd through commitment and engagement." },
  { id: "camus", label: "Camus", layer: 1, pos: t(190, 305), description: "Confronts the absurd through revolt, art, living fully. Split with Sartre over political violence. Sisyphus as affirmation." },
  { id: "kundera", label: "Kundera", layer: 1, pos: t(480, 290), description: "Novel as investigation of existence. Lived inside the system Lenin built. Lightness, kitsch, forgetting. Accumulation vs. subtraction identity models." },
  { id: "kafka", label: "Kafka", layer: 1, pos: t(365, 370), description: "Methodical documentation of institutional labyrinths. The flat report of the impossible. Humor and horror simultaneously, per DFW." },
  { id: "borges", label: "Borges", layer: 1, pos: t(725, 450), description: "Thought experiments in perfect prose. Cantor's infinities as architecture. Compression as ontology. Prose > poetry." },
  { id: "sabato", label: "Sábato", layer: 1, pos: t(105, 375), description: "'Poor man's Dostoevsky' — psychological obsession, already knows despair. El Túnel as Werther compressed and stripped of Romantic beauty." },
  { id: "pynchon", label: "Pynchon", layer: 1, pos: t(695, 240), description: "Is the system real or hallucination? Comic Kierkegaard. Lot 49: four layers operating simultaneously. Symphonic craft — everything placed deliberately across the whole." },
  { id: "dfw", label: "DFW", layer: 1, pos: t(815, 330), description: "Centripetal — consciousness, addiction, sincerity. Style becomes ethics. Kafka's humor essay, Dostoevsky's moral commitment. The serious writer avoids ideology." },
  { id: "orwell", label: "Orwell", layer: 1, pos: t(50, 275), description: "Pain as control. Animal Farm as critique of what Leninism becomes. Spanish Civil War as journalism becoming philosophy." },
  { id: "huxley", label: "Huxley", layer: 1, pos: t(655, 110), description: "Pleasure as control. Brave New World as dystopia of ambient normalcy. Mystical turn in late work." },
  { id: "asimov", label: "Asimov", layer: 1, pos: t(755, 115), description: "Psychohistory = Tolstoy's history as math. Three Laws = constitutional AI. Characters have personality even when subordinated to ideas — Hari Seldon isn't interchangeable." },
  { id: "egan", label: "Egan", layer: 1, pos: t(830, 130), description: "Philosopher of consciousness using fiction. Thought experiments as novels. Better ideas than execution." },
  { id: "pkd", label: "Philip K. Dick", layer: 1, pos: t(760, 185), description: "What if reality is fake? Dostoevsky's paranoia rewritten as sci-fi epistemology." },
  { id: "dazai", label: "Dazai", layer: 1, pos: t(325, 195), description: "Japanese Dostoevsky. No Longer Human: existentialism internalized as self-destruction. The outlier who performs normalcy until the performance consumes him." },
  { id: "aira", label: "Aira", layer: 1, pos: t(615, 460), description: "Cortázar's energy through Borges's obsessions. Fuga hacia adelante. Jazz improvisation craft — decades of preparation internalized, then forward motion without revision. Closure taxonomy: return / escape / reality crash." },
  { id: "sebald", label: "Sebald", layer: 1, pos: t(295, 490), description: "Meticulous search for truth that keeps dissolving. Philosophy hidden in architecture. Austerlitz (not knowing your past) vs. Emigrants (knowing too much — the pain of leaving). Butterfly as memory." },
  { id: "cusk", label: "Cusk", layer: 1, pos: t(380, 525), description: "Surgical precision. Novel as investigation through radical passivity. Faye as listener — meaning through omission and attention." },
  { id: "rand", label: "Ayn Rand", layer: 1, pos: t(700, 50), description: "Objectivism: rational self-interest as moral absolute. Nietzsche flattened — Übermensch stripped of ambiguity. Refuses the draft condition; performs kitsch as finished ideological product." },
  { id: "daempoli", label: "Da Empoli", layer: 1, pos: t(100, 310), description: "Modern realpolitik as fiction. Le Mage du Kremlin: power examined from inside the machine. Machiavelli's lineage in contemporary dress." },
  { id: "lenin", label: "Lenin", layer: 1, pos: t(230, 15), description: "Marx's theory → praxis. The one who actually tried to build the thing. What is to be done? answered in the concrete." },
  { id: "goethe", label: "Goethe", layer: 1, pos: t(510, 60), description: "Faust and Werther as foundational templates. The sensitive young man as self-annihilation engine. The intellectual who has consumed everything and found it insufficient." },
  { id: "mann", label: "Thomas Mann", layer: 1, pos: t(525, 80), description: "Magic Mountain as philosophical laboratory. Dostoevsky's method with German precision. Civilizational collapse rendered with warmth and ironic humor — brighter than most European contemporaries." },
  { id: "salinger", label: "Salinger", layer: 1, pos: t(385, 245), description: "Withdrawal as gesture. Nine Stories: the epiphany withheld. For Esme as the chance meeting that saves a life." },
  { id: "beckett", label: "Beckett", layer: 1, pos: t(225, 340), description: "The absurd stripped to minimum. Godot that never arrives. Hemingway's iceberg with the surface removed entirely." },
  { id: "marti", label: "Martí", layer: 1, pos: t(90, 360), description: "Poet-revolutionary. Cuba libre. The writer as political actor — pen and action as the same commitment." },
  { id: "galeano", label: "Galeano", layer: 1, pos: t(145, 395), description: "Open Veins of Latin America. Journalism becoming philosophy; history from the margins. Marxism applied to extraction." },
  { id: "morrison", label: "Morrison", layer: 1, pos: t(360, 560), description: "Beloved: 124 Bluestone as selective-space architecture. Supernatural escalation that surfaces what was always there. Family love as the structural exit from a closed system of damage." },
  { id: "liucixin", label: "Liu Cixin", layer: 1, pos: t(780, 220), description: "Ideas novelist in the Crichton mold with genuinely bigger conceptual ambitions. Dark Forest as cosmological architecture — game-theoretic Fermi-paradox answer. Prose as delivery vehicle." },

  // ===== LAYER 2 — PURE NOVELISTS =====
  { id: "hemingway", label: "Hemingway", layer: 2, pos: t(255, 280), description: "Iceberg method — sadness hidden under precision. Spanish Civil War in prose that refuses to explain. McCarthy's direct ancestor." },
  { id: "steinbeck", label: "Steinbeck", layer: 2, pos: t(195, 265), description: "American landscape with Faulkner's weight and Hemingway's prose clarity. East of Eden as Karamazov transplanted — Cain and Abel in Salinas." },
  { id: "zweig", label: "Zweig", layer: 2, pos: t(340, 160), description: "Psychological compression. Anti-Tolstoy: the great individual moment against history's smoke. Dostoevsky's depth without the religious crisis." },
  { id: "gibson", label: "Gibson", layer: 2, pos: t(800, 400), description: "Cyberpunk foundation. Neuromancer: the cyberspace metaphor we inherited. The future already in uneven distribution." },
  { id: "faulkner", label: "Faulkner", layer: 2, pos: t(220, 610), description: "The South as Yoknapatawpha. Sound and Fury: four voices across time. Benjy's collapsed time — too little cognitive filter." },
  { id: "bioycasares", label: "Bioy Casares", layer: 2, pos: t(655, 525), description: "La invención de Morel as template: ordinary premise opening a trapdoor. The Argentine mundane-to-uncanny lineage's novelist anchor." },
  { id: "cortazar", label: "Cortázar", layer: 2, pos: t(605, 490), description: "Casa tomada — domestic uncanny. Ceremonial form, the short story as ritual. Rayuela's forking reader." },
  { id: "garciamarquez", label: "García Márquez", layer: 2, pos: t(705, 520), description: "Myth saturating reality. One Hundred Years as generational epic. Magical realism as cultural default, not ironic gesture." },
  { id: "murakami", label: "Murakami", layer: 2, pos: t(590, 570), description: "Ambient impossible. The world just IS that way and nobody panics. Wells, cats, jazz, detachment." },
  { id: "saramago", label: "Saramago", layer: 2, pos: t(190, 555), description: "Unpunctuated flowing prose — same density as Sebald with more resistance. Evangelio, Blindness, All the Names." },
  { id: "schweblin", label: "Schweblin", layer: 2, pos: t(470, 645), description: "Inherits Casa Tomada. Watchmaker craft — every gear load-bearing, nothing decorative. Mundane becoming uninhabitable." },
  { id: "ogawa", label: "Ogawa", layer: 2, pos: t(605, 665), description: "The Memory Police: things disappear, people forget, everyone adjusts calmly. Horror in the acquiescence." },
  { id: "krasznahorkai", label: "Krasznahorkai", layer: 2, pos: t(410, 615), description: "Baron Wenckheim: municipal apocalypse, kenotic structure, Cantor's infinities as cognitive defeat. Prose you push through like frozen garbage." },
  { id: "murata", label: "Murata", layer: 2, pos: t(550, 615), description: "Convenience Store Woman: the outlier who performs normalcy as logistics, not anguish. Scripts explicit where everyone else's are invisible." },
  { id: "awad", label: "Mona Awad", layer: 2, pos: t(370, 695), description: "Visceral flood, not scalpel. Rouge: beauty-for-memory exchange as Faustian bargain. PhD on fairy-tale fear — Gothic architecture updated for beauty industry." },
  { id: "king", label: "Stephen King", layer: 2, pos: t(295, 745), description: "Domestic horror maximalist. Overlook = Casa Tomada with ghosts. Archetypal characters as vessels for moral propositions." },
  { id: "stoker", label: "Bram Stoker", layer: 2, pos: t(260, 680), description: "Dracula as Gothic origin: blood as medium of exchange, mirrors as unreliable perception. The victim wants the consumption." },
  { id: "lovecraft", label: "Lovecraft", layer: 2, pos: t(180, 680), description: "Cosmic horror: the universe is indifferent, incomprehensible, hostile. Opposite of Stoker's intimate bodily horror. Terror from scale, not proximity." },
  { id: "mccarthy", label: "McCarthy", layer: 2, pos: t(150, 770), description: "The Road: prose stripped to bone, biblical cadence. Moral parable, not psychological novel. The fire as relay. Total apocalypse where Krasznahorkai's is municipal." },
  { id: "cervantes", label: "Cervantes", layer: 2, pos: t(780, 500), description: "Don Quixote: the origin. The novel as self-aware form from the moment of its birth. The quest template and its ironic destabilization, simultaneously." },
  { id: "tolkien", label: "Tolkien", layer: 2, pos: t(840, 520), description: "Quest template crystallized. Ring as corrupting object; fellowship as the positive feedback loop against the system. Modern myth." },
  { id: "weir", label: "Weir", layer: 2, pos: t(760, 270), description: "Project Hail Mary as warm-register Crichton. Problem-solving as narrative engine. Zero philosophical weight; optimistic propulsion. Same ideas-first limitation as Liu Cixin, opposite emotional temperature." },
  { id: "femalegothic", label: "Female Gothic?", layer: 2, pos: t(225, 725), description: "FRONTIER NODE — unmapped cluster. Candidates: Shirley Jackson, Angela Carter, Carmen Maria Machado, Daphne du Maurier. The tradition that carries Stoker's bodily horror forward through writers reclaiming it for women's embodied experience.", isFrontier: true },
];

// ============================================================
// EDGES (~250)
// ============================================================

const EDGES = [
  // ===== NIETZSCHE AXIS =====
  { s: "nietzsche", t: "dostoevsky", label: "same diagnosis, opposite prescriptions", type: "dialogue", desc: "Same recognition that suffering is constitutive of being human; divergent prescriptions. Dostoevsky: descend until you hit transcendence (grace). Nietzsche: descend until you transform into something that no longer needs the transcendent (amor fati). The dialogue edge's paradigm." },
  { s: "nietzsche", t: "schopenhauer", label: "will inherited, pessimism rejected", type: "divergence" },
  { s: "nietzsche", t: "kierkegaard", label: "opposite rebellions", type: "tension", desc: "Both rebel against systematic philosophy, opposite directions — faith vs. will to power." },
  { s: "nietzsche", t: "camus", label: "absurd as affirmation", type: "genealogy", desc: "Sisyphus must be imagined happy — that's Nietzschean." },
  { s: "nietzsche", t: "hesse", label: "Zarathustra ↔ Steppenwolf", type: "parallel" },
  { s: "nietzsche", t: "kundera", label: "eternal recurrence", type: "parallel" },
  { s: "nietzsche", t: "rand", label: "flattened inheritance", type: "divergence", desc: "Rand takes Nietzsche's ambiguity out and sells the residue. Objectivism as Nietzsche minus the self-undermining." },
  { s: "nietzsche", t: "ingenieros", label: "Argentine reception", type: "genealogy" },

  // ===== DOSTOEVSKY AXIS =====
  { s: "dostoevsky", t: "kundera", label: "Gambler ↔ Joke", type: "parallel", desc: "Same architecture: single gesture triggers destruction. But Dostoevsky's world has too much meaning, Kundera's too little." },
  { s: "dostoevsky", t: "kafka", label: "alienation lineage", type: "genealogy", desc: "Underground Man to Gregor Samsa — alienation first internalized, then made literal." },
  { s: "dostoevsky", t: "tolstoy", label: "Russian poles", type: "tension", desc: "Moral vision clarified through narrative (Tolstoy) vs. polyphony without author-god (Dostoevsky). Same tradition, opposite form." },
  { s: "dostoevsky", t: "dazai", label: "Japanese branch", type: "genealogy", desc: "No Longer Human is Notes from Underground transposed into post-war Japanese shame culture." },
  { s: "dostoevsky", t: "sabato", label: "poor man's Dostoevsky", type: "genealogy" },
  { s: "dostoevsky", t: "steinbeck", label: "moral architecture", type: "parallel", desc: "East of Eden as Karamazov in California. Cain and Abel in Salinas." },
  { s: "dostoevsky", t: "krasznahorkai", label: "provincial darkness", type: "parallel", desc: "Provincial towns as laboratories for human darkness. Fascism emerging from ordinary desperation." },
  { s: "dostoevsky", t: "mann", label: "ideas in characters", type: "genealogy", desc: "Mann acknowledged the debt. Sanatorium drawing rooms as philosophical labs." },
  { s: "dostoevsky", t: "pkd", label: "paranoia lineage", type: "genealogy" },
  { s: "dostoevsky", t: "pynchon", label: "paranoia branch", type: "divergence" },
  { s: "dostoevsky", t: "dfw", label: "Joseph Frank essay", type: "dialogue", desc: "DFW's deepest literary criticism. Style as ethics. Messy prose IS the moral argument — cleaning it up would make suffering consumable." },
  { s: "dostoevsky", t: "tolkien", label: "moral cosmos", type: "parallel" },
  { s: "dostoevsky", t: "hesse", label: "meditation as departure", type: "divergence" },

  // ===== KUNDERA AXIS =====
  { s: "kundera", t: "kierkegaard", label: "irony as method", type: "parallel" },
  { s: "kundera", t: "kafka", label: "Central European axis", type: "parallel", desc: "Prague lineage. Kafka's institutional absurdity becomes Kundera's political absurdity." },
  { s: "kundera", t: "cusk", label: "novel as investigation", type: "parallel" },
  { s: "kundera", t: "hesse", label: "philosophical novel", type: "parallel" },
  { s: "kundera", t: "tolstoy", label: "compressed + ironic", type: "tension" },
  { s: "kundera", t: "orwell", label: "totalitarianism examined", type: "parallel", desc: "Orwell from outside, Kundera from inside." },
  { s: "kundera", t: "han", label: "transparency = kitsch", type: "parallel", desc: "Kundera's kitsch (erasure of ambiguity, demand for legibility) is what Han formalizes as transparency. Same flattening, different political system." },
  { s: "kundera", t: "fisher", label: "kitsch as episteme", type: "parallel", desc: "Fisher's 'we can't imagine alternatives' is Kundera's kitsch at maximum: not just denying what doesn't fit, eliminating the capacity to conceive of alternatives." },
  { s: "kundera", t: "zizek", label: "three-way on heaviness", type: "parallel", desc: "Kundera: the heaviness is fake. Žižek: we know it's fake and participate anyway. Han: we forgot what real heaviness would mean." },
  { s: "kundera", t: "mann", label: "ironic ideas", type: "parallel" },
  { s: "kundera", t: "krasznahorkai", label: "civility as kitsch", type: "parallel", desc: "People maintaining social forms while the world collapses. Paper-thin heaviness." },
  { s: "kundera", t: "awad", label: "accumulation tested", type: "parallel" },
  { s: "kundera", t: "ogawa", label: "lightness as dissolution", type: "parallel" },

  // ===== KAFKA =====
  { s: "kafka", t: "borges", label: "shared problem space", type: "dialogue" },
  { s: "kafka", t: "sebald", label: "same process", type: "parallel", desc: "Meticulous search through dissolving labyrinths. Flat precise tone reporting the impossible." },
  { s: "kafka", t: "krasznahorkai", label: "institutional decay", type: "parallel", desc: "Methodical documentation of systems failing." },
  { s: "kafka", t: "murata", label: "performing normalcy", type: "parallel", desc: "Kafka's protagonists fail at the performance. Keiko succeeds — more disturbing." },
  { s: "kafka", t: "pkd", label: "reality dissolving", type: "parallel" },
  { s: "kafka", t: "foucault", label: "institutional power", type: "parallel", desc: "The Castle and The Trial are the literary form of Foucault's analysis: power through procedure." },
  { s: "kafka", t: "beckett", label: "waiting without resolution", type: "parallel", desc: "The Castle and Godot — the system may have purpose but you'll never know." },
  { s: "kafka", t: "dfw", label: "humor essay", type: "parallel", desc: "Funny and horrifying simultaneously. The comedy intensifies rather than relieves the horror. Sisyphus laughing." },
  { s: "kafka", t: "schweblin", label: "uncanny structures", type: "parallel" },

  // ===== BORGES =====
  { s: "borges", t: "bioycasares", label: "collaborators", type: "parallel" },
  { s: "borges", t: "cortazar", label: "Argentine split", type: "tension", desc: "Compression and paradox vs. atmosphere and ritual. Same country, opposite instincts." },
  { s: "borges", t: "aira", label: "conceptual obsessions", type: "genealogy" },
  { s: "borges", t: "egan", label: "thought experiments", type: "parallel" },
  { s: "borges", t: "krasznahorkai", label: "Cantor's infinities", type: "parallel", desc: "Infinity as architecture. The Library of Babel and the professor's Cantorian cognitive defeat." },
  { s: "borges", t: "pynchon", label: "library and Tristero", type: "parallel" },
  { s: "borges", t: "ingenieros", label: "Argentine intellectual", type: "parallel" },
  { s: "borges", t: "garciamarquez", label: "fictional worlds", type: "parallel" },

  // ===== AIRA =====
  { s: "aira", t: "cortazar", label: "ludic energy", type: "genealogy" },
  { s: "aira", t: "schweblin", label: "head vs. gut", type: "tension", desc: "Aira: jazz improvisation, see a structure impossible to anticipate. Schweblin: watchmaker, feel something impossible to name. Same tradition, opposite craft." },
  { s: "aira", t: "krasznahorkai", label: "taxonomical instinct", type: "parallel", desc: "Aira's closure taxonomy (return / escape / reality crash) kin to Krasznahorkai's decay modes. Structural instinct about how narratives end when conventional resolution is refused." },
  { s: "aira", t: "pynchon", label: "jazz vs. symphony", type: "tension", desc: "Aira forward without revision. Pynchon composes, layers, revises. Preparation at different points in the process." },
  { s: "aira", t: "cervantes", label: "quest absurdity", type: "parallel" },

  // ===== CORTÁZAR =====
  { s: "cortazar", t: "bioycasares", label: "mundane -> uncanny", type: "genealogy" },
  { s: "cortazar", t: "schweblin", label: "Casa Tomada -> all", type: "genealogy", desc: "The ur-text. Domestic space invaded by something never named. Distancia de rescate in embryo." },
  { s: "cortazar", t: "king", label: "Overlook = Casa Tomada", type: "parallel" },

  // ===== SCHWEBLIN =====
  { s: "schweblin", t: "bioycasares", label: "gut-punch lineage", type: "genealogy" },
  { s: "schweblin", t: "ogawa", label: "quiet horror", type: "parallel", desc: "Calm surfaces over slow dread. Individual/active (Schweblin) vs. collective/passive (Ogawa)." },
  { s: "schweblin", t: "awad", label: "visceral kinship", type: "parallel" },

  // ===== OGAWA =====
  { s: "ogawa", t: "murata", label: "calm adjustment", type: "parallel", desc: "Japanese diagnoses of contemporary consciousness. Ogawa: erasure from outside. Murata: performance from inside." },
  { s: "ogawa", t: "awad", label: "memory erasure", type: "parallel", desc: "Collective passive (Memory Police) vs. individual active (Rouge). Both converge on Kundera's lightness." },
  { s: "ogawa", t: "mccarthy", label: "worlds stripped", type: "parallel" },

  // ===== MURATA =====
  { s: "murata", t: "han", label: "scripts as survival", type: "parallel", desc: "Self-optimization as logistics, not ideology. The scripts are explicit where everyone else's are invisible." },
  { s: "murata", t: "camus", label: "outlier indifference", type: "parallel", desc: "Meursault destroyed for it. Keiko adapts and survives." },
  { s: "murata", t: "dazai", label: "outlier types", type: "tension", desc: "Yozo consumed by the performance. Keiko efficient, unsuffering. New category." },
  { s: "murata", t: "sebald", label: "identity-as-role", type: "parallel", desc: "Paul Bereyter's classroom, Keiko's store. Take the role away and the self has no scaffold." },

  // ===== McCARTHY =====
  { s: "mccarthy", t: "hemingway", label: "prose heir", type: "genealogy", desc: "Iceberg method darker. Hemingway hides sadness; McCarthy hides horror." },
  { s: "mccarthy", t: "camus", label: "carrying the fire", type: "parallel", desc: "Father as Sisyphus. No rational reason to continue. He continues." },
  { s: "mccarthy", t: "king", label: "archetypal vessels", type: "parallel" },
  { s: "mccarthy", t: "sebald", label: "unrecoverable past", type: "parallel", desc: "Sebald: displacement. McCarthy: annihilation." },
  { s: "mccarthy", t: "krasznahorkai", label: "total vs. municipal apocalypse", type: "tension" },
  { s: "mccarthy", t: "fisher", label: "end of world easier", type: "parallel" },
  { s: "mccarthy", t: "awad", label: "family as exit", type: "parallel", desc: "Rouge: hyper-civilization's trap, exit through mother-daughter love. Road: no civilization, same irreducible unit." },
  { s: "mccarthy", t: "faulkner", label: "Southern lineage", type: "parallel" },

  // ===== DFW =====
  { s: "dfw", t: "pynchon", label: "thesis vs. antithesis", type: "tension", desc: "Both American maximalists, opposite directions. Pynchon: paranoid systems, centrifugal. DFW: warm interiority, centripetal." },
  { s: "dfw", t: "faulkner", label: "Nastasya ↔ Caddy", type: "parallel", desc: "Structural parallel DFW spotted: women as absent centers — black holes of male consciousness." },
  { s: "dfw", t: "sartre", label: "consciousness-as-trap", type: "parallel" },
  { s: "dfw", t: "fisher", label: "depression as political", type: "parallel", desc: "Fisher's capitalist realism experienced from inside a single consciousness." },
  { s: "dfw", t: "hemingway", label: "say less vs. everything", type: "tension" },

  // ===== PYNCHON =====
  { s: "pynchon", t: "tolstoy", label: "same smoke", type: "parallel" },
  { s: "pynchon", t: "kierkegaard", label: "indirect communication", type: "parallel" },
  { s: "pynchon", t: "faulkner", label: "Benjy ↔ Oedipa", type: "tension", desc: "Too little filter (Benjy) vs. too many signals (Oedipa). Same disorientation, opposite cause." },
  { s: "pynchon", t: "sebald", label: "opposite responses", type: "tension" },
  { s: "pynchon", t: "foucault", label: "hidden systems", type: "parallel", desc: "Panopticon is paranoia made theoretical." },
  { s: "pynchon", t: "fisher", label: "cancelled future", type: "parallel" },
  { s: "pynchon", t: "bakunin", label: "anarchist networks", type: "parallel", desc: "Lot 49's Tristero = shadow communication beneath official systems. Bakunin's decentralized liberation as paranoid fiction." },
  { s: "pynchon", t: "pkd", label: "American paranoia", type: "parallel" },

  // ===== FISHER =====
  { s: "fisher", t: "han", label: "parallel diagnoses", type: "parallel", desc: "Fisher names the system; Han describes living inside it." },
  { s: "fisher", t: "zizek", label: "critique absorbed", type: "tension", desc: "Žižek still believes in rupture. Fisher argues capitalist realism absorbs critique the way it absorbs everything." },
  { s: "fisher", t: "awad", label: "realism in a face mask", type: "parallel", desc: "Rouge: the system feels like care, alternatives are unimaginable." },
  { s: "fisher", t: "foucault", label: "archaeology of limits", type: "genealogy" },
  { s: "fisher", t: "liucixin", label: "cancelled future", type: "parallel", desc: "Dark Forest escapism and 400-year fatalism as climate discourse transposed. Both: threats on timelines long enough to defer indefinitely." },

  // ===== BUBER =====
  { s: "buber", t: "cusk", label: "I-Thou through listening", type: "parallel", desc: "Faye's radical attention is one of the few contemporary literary demonstrations of I-Thou as prose." },
  { s: "buber", t: "han", label: "transparency strips encounter", type: "parallel" },
  { s: "buber", t: "murata", label: "pure I-It", type: "parallel", desc: "Keiko experiences only I-It. The social scripts are explicit. The horror is entirely in how efficient her performance is." },

  // ===== HAN =====
  { s: "han", t: "awad", label: "self-exploitation", type: "parallel", desc: "Skincare rituals as Han's self-exploitation in practice: voluntary, pleasurable, consuming." },
  { s: "han", t: "mann", label: "outside productivity", type: "tension", desc: "Sanatorium as space outside achievement society. Freedom or illness?" },
  { s: "han", t: "egan", label: "eternal optimization", type: "parallel" },

  // ===== CUSK =====
  { s: "cusk", t: "sebald", label: "prepared Carlos for", type: "reading_path" },
  { s: "cusk", t: "salinger", label: "fragment as person", type: "parallel" },
  { s: "cusk", t: "hemingway", label: "meaning through omission", type: "parallel" },

  // ===== SEBALD =====
  { s: "sebald", t: "saramago", label: "flowing prose", type: "parallel" },
  { s: "sebald", t: "tolstoy", label: "Austerlitz connects", type: "parallel" },
  { s: "sebald", t: "krasznahorkai", label: "European ruins", type: "parallel", desc: "Sebald whispers. Krasznahorkai screams. Elegy vs. apocalypse." },
  { s: "sebald", t: "kafka", label: "process kin", type: "parallel" },

  // ===== KRASZNAHORKAI =====
  { s: "krasznahorkai", t: "saramago", label: "long flowing prose", type: "parallel", desc: "Unpunctuated sentences. Krasznahorkai more suffocating; Saramago more resistant." },
  { s: "krasznahorkai", t: "beckett", label: "stripped endurance", type: "parallel" },
  { s: "krasznahorkai", t: "faulkner", label: "sequential monologues", type: "parallel", desc: "Baron Wenckheim's theater of voices as Sound-and-the-Fury structure at Hungarian scale." },
  { s: "krasznahorkai", t: "liucixin", label: "apocalypse at scale", type: "parallel", desc: "Municipal apocalypse scaled to cosmic. Same structural claim (civilizations in silence, collapsing unobserved)." },

  // ===== AWAD =====
  { s: "awad", t: "zizek", label: "beauty-truth from inside", type: "parallel" },
  { s: "awad", t: "stoker", label: "blood → beauty exchange", type: "genealogy", desc: "Rouge inherits Dracula's architecture: blood/beauty exchange, mirrors, sun as enemy." },
  { s: "awad", t: "garciamarquez", label: "surface resemblance", type: "tension" },
  { s: "awad", t: "femalegothic", label: "possible lineage", type: "frontier_link" },
  { s: "awad", t: "king", label: "maximalist horror", type: "parallel" },
  { s: "awad", t: "goethe", label: "Faustian bargain", type: "genealogy" },

  // ===== STOKER =====
  { s: "stoker", t: "king", label: "domestic Gothic", type: "genealogy" },
  { s: "stoker", t: "femalegothic", label: "Gothic origin", type: "genealogy" },
  { s: "stoker", t: "lovecraft", label: "paired horror origins", type: "tension", desc: "Intimate/bodily (Stoker) vs. cosmic/impersonal (Lovecraft)." },

  // ===== CAMUS =====
  { s: "camus", t: "sartre", label: "split on violence", type: "divergence" },
  { s: "camus", t: "hemingway", label: "flat prose, hidden depth", type: "parallel" },
  { s: "camus", t: "orwell", label: "political engagement", type: "parallel" },
  { s: "camus", t: "goethe", label: "opposite responses to absurd", type: "tension", desc: "Faust refuses the absurd through total knowledge. Sisyphus accepts it." },
  { s: "camus", t: "beckett", label: "absurd as theater", type: "parallel" },
  { s: "camus", t: "marti", label: "engaged rebel", type: "parallel" },

  // ===== HEMINGWAY =====
  { s: "hemingway", t: "tolstoy", label: "primary rival", type: "tension" },
  { s: "hemingway", t: "steinbeck", label: "prose kinship", type: "parallel" },
  { s: "hemingway", t: "orwell", label: "Spanish Civil War", type: "parallel" },
  { s: "hemingway", t: "sartre", label: "hidden existentialism", type: "parallel" },
  { s: "hemingway", t: "beckett", label: "radical economy", type: "parallel" },
  { s: "hemingway", t: "king", label: "Long Walk kinship", type: "parallel" },

  // ===== STEINBECK =====
  { s: "steinbeck", t: "faulkner", label: "American landscape", type: "parallel" },
  { s: "steinbeck", t: "cervantes", label: "Arthurian project", type: "parallel" },

  // ===== ZWEIG =====
  { s: "zweig", t: "tolstoy", label: "anti-Tolstoy", type: "tension", desc: "The great moment vs. the smoke." },
  { s: "zweig", t: "dostoevsky", label: "psychological depth", type: "parallel" },
  { s: "zweig", t: "galeano", label: "opposite vantage points", type: "tension", desc: "History as narrative, European center vs. Latin American periphery." },

  // ===== ORWELL / HUXLEY =====
  { s: "orwell", t: "huxley", label: "pain vs. pleasure", type: "tension" },
  { s: "orwell", t: "foucault", label: "surveillance theory", type: "parallel", desc: "Telescreen as Foucault's panopticon as fiction." },
  { s: "orwell", t: "marti", label: "writer as actor", type: "parallel" },
  { s: "orwell", t: "galeano", label: "journalism as philosophy", type: "parallel" },
  { s: "huxley", t: "hesse", label: "mystical turn", type: "parallel" },
  { s: "huxley", t: "murakami", label: "ambient dystopia", type: "parallel" },

  // ===== ASIMOV / SCI-FI =====
  { s: "asimov", t: "tolstoy", label: "history as math", type: "parallel" },
  { s: "asimov", t: "zweig", label: "systems vs. moments", type: "tension" },
  { s: "asimov", t: "pynchon", label: "hidden systems", type: "parallel" },
  { s: "asimov", t: "huxley", label: "sci-fi worldbuilding", type: "parallel" },
  { s: "asimov", t: "egan", label: "ideas over characters", type: "parallel" },
  { s: "asimov", t: "liucixin", label: "ethical vs. cosmological", type: "tension", desc: "Asimov stress-tests ethical architecture (Three Laws). Liu stress-tests cosmological architecture (Dark Forest). Both philosophical engineers." },
  { s: "egan", t: "pkd", label: "opposite approaches", type: "tension" },
  { s: "egan", t: "heidegger", label: "death made optional", type: "tension" },
  { s: "egan", t: "han", label: "eternal optimization", type: "parallel" },

  // ===== GIBSON =====
  { s: "gibson", t: "pkd", label: "cyber-Dick", type: "genealogy" },
  { s: "gibson", t: "asimov", label: "hard SF lineage", type: "genealogy" },
  { s: "gibson", t: "pynchon", label: "systemic paranoia", type: "parallel" },

  // ===== LIU CIXIN / WEIR =====
  { s: "liucixin", t: "weir", label: "ideas-first craft", type: "tension", desc: "Dread vs. warmth. Same craft limitation (prose subordinated to idea); opposite emotional register." },
  { s: "liucixin", t: "dostoevsky", label: "moral architecture told, not felt", type: "tension", desc: "Ye Wenjie's conclusion told. Ivan's Grand Inquisitor makes the same argument so you almost agree." },
  { s: "weir", t: "asimov", label: "problem-solving inheritance", type: "genealogy" },

  // ===== MORRISON =====
  { s: "morrison", t: "faulkner", label: "haunted South", type: "parallel" },
  { s: "morrison", t: "mccarthy", label: "family as exit", type: "parallel" },
  { s: "morrison", t: "awad", label: "selective-space architecture", type: "parallel", desc: "124 Bluestone ↔ the spa. Spaces with agency that refuse some entrants." },
  { s: "morrison", t: "krasznahorkai", label: "supernatural as surface", type: "parallel", desc: "Supernatural escalation that surfaces what was always there — not invasion but revelation." },
  { s: "morrison", t: "dostoevsky", label: "moral polyphony", type: "parallel" },

  // ===== MANN =====
  { s: "mann", t: "hesse", label: "German contemporaries", type: "parallel" },
  { s: "mann", t: "tolstoy", label: "civilization in individuals", type: "parallel" },
  { s: "mann", t: "goethe", label: "Goethe's heir", type: "genealogy", desc: "Doctor Faustus as Faust retold for German culture's descent into Nazism." },

  // ===== GOETHE =====
  { s: "goethe", t: "hesse", label: "German lineage", type: "genealogy" },
  { s: "goethe", t: "dostoevsky", label: "Faustian architecture", type: "parallel" },
  { s: "goethe", t: "dazai", label: "Werther → No Longer Human", type: "parallel" },
  { s: "goethe", t: "sabato", label: "draining reads", type: "parallel" },

  // ===== SABATO =====
  { s: "sabato", t: "sartre", label: "consciousness-as-trap", type: "parallel" },
  { s: "sabato", t: "camus", label: "absurd without revolt", type: "tension" },

  // ===== SALINGER =====
  { s: "salinger", t: "hemingway", label: "prose discipline", type: "parallel" },
  { s: "salinger", t: "dazai", label: "sensitive self-annihilation", type: "parallel" },
  { s: "salinger", t: "dfw", label: "sincerity problem", type: "parallel" },
  { s: "salinger", t: "kundera", label: "contingency saves", type: "parallel", desc: "For Esme: chance meeting becomes load-bearing months later." },
  { s: "salinger", t: "murata", label: "withdrawal as logistics", type: "parallel" },

  // ===== BECKETT =====
  { s: "beckett", t: "murata", label: "repetition as meaning", type: "parallel" },

  // ===== MARTI =====
  { s: "marti", t: "lenin", label: "theory into praxis", type: "tension" },
  { s: "marti", t: "bakunin", label: "liberation movements", type: "parallel" },

  // ===== GALEANO =====
  { s: "galeano", t: "marx", label: "applied to extraction", type: "genealogy" },

  // ===== FOUCAULT =====
  { s: "foucault", t: "han", label: "power internalized", type: "genealogy" },
  { s: "foucault", t: "zizek", label: "ideology critique", type: "tension" },

  // ===== BAKUNIN / ANARCHISTS =====
  { s: "bakunin", t: "marx", label: "First International split", type: "divergence" },
  { s: "bakunin", t: "kropotkin", label: "anarchist tradition", type: "parallel" },
  { s: "kropotkin", t: "malatesta", label: "praxis vs. theory", type: "parallel" },
  { s: "kropotkin", t: "nietzsche", label: "anti-competition", type: "tension" },

  // ===== LENIN / MACHIAVELLI =====
  { s: "lenin", t: "marx", label: "praxis", type: "genealogy" },
  { s: "machiavelli", t: "daempoli", label: "realpolitik lineage", type: "genealogy" },
  { s: "machiavelli", t: "berlin", label: "liberal response", type: "tension" },
  { s: "berlin", t: "marx", label: "pluralist answer", type: "tension" },

  // ===== INGENIEROS / JAURETCHE =====
  { s: "ingenieros", t: "jauretche", label: "Argentine opposites", type: "tension" },
  { s: "ingenieros", t: "sabato", label: "Argentine pessimism", type: "parallel" },
  { s: "jauretche", t: "kundera", label: "kitsch as class", type: "parallel" },
  { s: "jauretche", t: "zizek", label: "ideology of taste", type: "parallel" },
  { s: "jauretche", t: "marti", label: "Latin American voice", type: "parallel" },
  { s: "jauretche", t: "galeano", label: "anti-colonial kin", type: "parallel" },

  // ===== GARCIA MARQUEZ / MURAKAMI =====
  { s: "garciamarquez", t: "cortazar", label: "boom", type: "parallel" },
  { s: "garciamarquez", t: "murakami", label: "ambient impossible", type: "parallel" },
  { s: "murakami", t: "ogawa", label: "Japanese uncanny", type: "parallel" },

  // ===== CERVANTES / TOLKIEN =====
  { s: "cervantes", t: "tolkien", label: "quest template", type: "genealogy" },
  { s: "cervantes", t: "borges", label: "self-aware fiction", type: "parallel" },
  { s: "cervantes", t: "pynchon", label: "quest deconstructed", type: "parallel" },
  { s: "cervantes", t: "kundera", label: "novel as form", type: "parallel" },
  { s: "cervantes", t: "steinbeck", label: "Arthurian inheritance", type: "parallel" },
  { s: "cervantes", t: "aira", label: "quest license", type: "genealogy" },
  { s: "tolkien", t: "dostoevsky", label: "moral cosmos", type: "parallel" },
  { s: "tolkien", t: "hesse", label: "quest inwardness", type: "parallel" },

  // ===== SCHOPENHAUER =====
  { s: "schopenhauer", t: "tolstoy", label: "pessimism absorbed", type: "genealogy" },
  { s: "schopenhauer", t: "borges", label: "will and representation", type: "genealogy" },
  { s: "schopenhauer", t: "kundera", label: "weight as counterforce", type: "parallel" },
];

// ============================================================
// THREE.JS COMPONENT
// ============================================================

export default function LiteraryNetwork3D() {
  const mountRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [visibleEdgeTypes, setVisibleEdgeTypes] = useState(
    new Set(Object.keys(EDGE_COLORS))
  );
  const [pathFrom, setPathFrom] = useState(null);
  const [pathTo, setPathTo] = useState(null);

  const nodeMap = useMemo(() => {
    const m = {};
    NODES.forEach((n) => (m[n.id] = n));
    return m;
  }, []);

  const selNode = selected ? nodeMap[selected] : null;
  const selEdges = useMemo(
    () =>
      selected
        ? EDGES.filter((e) => e.s === selected || e.t === selected).filter((e) =>
            visibleEdgeTypes.has(e.type)
          )
        : [],
    [selected, visibleEdgeTypes]
  );

  // BFS between pathFrom and pathTo
  const pathEdges = useMemo(() => {
    if (!pathFrom || !pathTo || pathFrom === pathTo) return [];
    const adj = {};
    EDGES.forEach((e) => {
      if (!visibleEdgeTypes.has(e.type)) return;
      (adj[e.s] ||= []).push({ to: e.t, edge: e });
      (adj[e.t] ||= []).push({ to: e.s, edge: e });
    });
    const q = [[pathFrom, []]];
    const seen = new Set([pathFrom]);
    while (q.length) {
      const [cur, trail] = q.shift();
      if (cur === pathTo) return trail;
      for (const { to, edge } of adj[cur] || []) {
        if (seen.has(to)) continue;
        seen.add(to);
        q.push([to, [...trail, edge]]);
      }
    }
    return [];
  }, [pathFrom, pathTo, visibleEdgeTypes]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth;
    const h = mount.clientHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#05051a");

    const camera = new THREE.PerspectiveCamera(55, w / h, 1, 2000);
    camera.position.set(0, 40, 320);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Nodes
    const nodeMeshes = {};
    NODES.forEach((n) => {
      const color = new THREE.Color(LAYER_META[n.layer].color);
      const geom = new THREE.SphereGeometry(n.isFrontier ? 2.5 : 3.3, 16, 16);
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: n.isFrontier ? 0.5 : 0.9,
        wireframe: n.isFrontier,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(n.pos[0] * 0.25, LAYER_META[n.layer].y, n.pos[1] * 0.25);
      mesh.userData.id = n.id;
      nodeMeshes[n.id] = mesh;
      scene.add(mesh);
    });

    // Edges
    const edgeObjs = [];
    EDGES.forEach((e) => {
      if (!visibleEdgeTypes.has(e.type)) return;
      const a = nodeMeshes[e.s]?.position;
      const b = nodeMeshes[e.t]?.position;
      if (!a || !b) return;
      const geom = new THREE.BufferGeometry().setFromPoints([a, b]);
      const isPathEdge = pathEdges.includes(e);
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(EDGE_COLORS[e.type] || "#444"),
        transparent: true,
        opacity: isPathEdge ? 1 : 0.35,
        linewidth: isPathEdge ? 2 : 1,
      });
      const line = new THREE.Line(geom, mat);
      edgeObjs.push(line);
      scene.add(line);
    });

    // Raycaster for clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const handleClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Object.values(nodeMeshes));
      if (intersects.length > 0) {
        const id = intersects[0].object.userData.id;
        setSelected(id);
      }
    };
    renderer.domElement.addEventListener("click", handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const nw = mount.clientWidth;
      const nh = mount.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      renderer.domElement.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [visibleEdgeTypes, pathEdges]);

  // Type-ahead matches
  const searchMatches = search
    ? NODES.filter((n) =>
        n.label.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 8)
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#05051a", color: "#b8b0c8", fontFamily: "ui-sans-serif, system-ui" }}>
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #1a1a3a", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "#d4b86a" }}>
          Literary Network 3D · v7
        </h1>
        <input
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "4px 8px", background: "#12122a", border: "1px solid #2a2a4a", color: "#b8b0c8", fontSize: 12, borderRadius: 4 }}
        />
        {searchMatches.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {searchMatches.map((n) => (
              <button
                key={n.id}
                onClick={() => { setSelected(n.id); setSearch(""); }}
                style={{ fontSize: 10, padding: "2px 6px", background: "#1a1a3a", color: LAYER_META[n.layer].color, border: "none", borderRadius: 3, cursor: "pointer" }}
              >
                {n.label}
              </button>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 6, marginLeft: "auto", flexWrap: "wrap" }}>
          {Object.entries(EDGE_LABELS).map(([k, label]) => (
            <button
              key={k}
              onClick={() => {
                const next = new Set(visibleEdgeTypes);
                next.has(k) ? next.delete(k) : next.add(k);
                setVisibleEdgeTypes(next);
              }}
              style={{
                fontSize: 9,
                padding: "2px 6px",
                background: visibleEdgeTypes.has(k) ? EDGE_COLORS[k] + "30" : "#0a0a1a",
                color: visibleEdgeTypes.has(k) ? EDGE_COLORS[k] : "#4a4a6a",
                border: `1px solid ${visibleEdgeTypes.has(k) ? EDGE_COLORS[k] : "#2a2a4a"}`,
                borderRadius: 3,
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div ref={mountRef} style={{ flex: 1, position: "relative" }} />
      {selNode && (
        <div style={{ padding: "12px 18px", background: "#0a0a1e", borderTop: `1px solid ${LAYER_META[selNode.layer].color}30`, maxHeight: "40vh", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: LAYER_META[selNode.layer].color, boxShadow: `0 0 6px ${LAYER_META[selNode.layer].color}60` }} />
            <h2 style={{ fontSize: 14, fontWeight: 700, color: LAYER_META[selNode.layer].color, margin: 0 }}>{selNode.label}</h2>
            <span style={{ fontSize: 9, color: "#5a5878", textTransform: "uppercase", letterSpacing: 1 }}>
              {LAYER_META[selNode.layer].label}
            </span>
            <button
              onClick={() => setPathFrom(selNode.id)}
              style={{ marginLeft: "auto", fontSize: 9, padding: "2px 6px", background: "#1a1a3a", color: "#b8b0c8", border: "none", borderRadius: 3, cursor: "pointer" }}
            >
              Path from
            </button>
            <button
              onClick={() => setPathTo(selNode.id)}
              style={{ fontSize: 9, padding: "2px 6px", background: "#1a1a3a", color: "#b8b0c8", border: "none", borderRadius: 3, cursor: "pointer" }}
            >
              Path to
            </button>
          </div>
          <p style={{ fontSize: 12, color: "#b8b0c8", margin: "0 0 8px", lineHeight: 1.5 }}>{selNode.description}</p>
          {selEdges.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {selEdges.map((edge, i) => {
                const otherId = edge.s === selected ? edge.t : edge.s;
                const other = nodeMap[otherId];
                const ec = EDGE_COLORS[edge.type] || "#444";
                return (
                  <div
                    key={i}
                    onClick={() => setSelected(otherId)}
                    style={{ padding: "5px 9px", background: "#12122a", borderRadius: 5, borderLeft: `3px solid ${ec}`, flex: "1 1 260px", minWidth: 180, cursor: "pointer" }}
                  >
                    <span style={{ fontSize: 10.5, fontWeight: 600, color: ec }}>→ {other?.label}</span>
                    {edge.label && <span style={{ fontSize: 8.5, color: "#5a5878", marginLeft: 5 }}>{edge.label}</span>}
                    {edge.desc && <p style={{ fontSize: 10, color: "#8a8698", margin: "2px 0 0", lineHeight: 1.3 }}>{edge.desc}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
