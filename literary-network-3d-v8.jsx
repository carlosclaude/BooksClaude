import { useState, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";

const LAYER_META = [
  { y: 0,   label: "PHILOSOPHERS",        sub: "Pure Thought",       color: "#1a7a8a", gridColor: 0xd0e8ee },
  { y: 150, label: "IDEAS THROUGH FICTION", sub: "Novel as Philosophy", color: "#c42040", gridColor: 0xeed0d6 },
  { y: 300, label: "PURE NOVELISTS",      sub: "Story & Craft",      color: "#b8860b", gridColor: 0xeee0c0 },
];

const t = (x, y) => [(x - 480) * 0.55, (y - 400) * 0.55];

const NODES = [
  // === LAYER 0: PHILOSOPHERS ===
  { id: "nietzsche", label: "Nietzsche", layer: 0, pos: t(535, 95), description: "The absurd as affirmation. Will to power, eternal recurrence. Depth charge connecting to almost everything." },
  { id: "kierkegaard", label: "Kierkegaard", layer: 0, pos: t(525, 170), description: "Absurdity requires irony, not just dread. Indirect communication through masks." },
  { id: "heidegger", label: "Heidegger", layer: 0, pos: t(175, 195), description: "Being-toward-death. Temporality as the ground of existence." },
  { id: "hegel", label: "Hegel", layer: 0, pos: t(435, 25), description: "Cathedrals of seriousness. Dialectics. The system Kierkegaard rebels against and Marx inverts." },
  { id: "han", label: "Byung-Chul Han", layer: 0, pos: t(130, 140), description: "Third model of control: self-exploitation through achievement. Burnout society. Transparency as the new kitsch. Dissolution of ritual." },
  { id: "zizek", label: "Zizek", layer: 0, pos: t(340, 30), description: "Neo-Marxist, Lacanian, Hegelian. Surplus enjoyment: the subject enjoys its own exploitation. Sharp tongue, uses pop culture and sci-fi to illustrate ideology. Same modern diagnosis as Han but dialectical and loud where Han is phenomenological and quiet." },
  { id: "marx", label: "Marx", layer: 0, pos: t(280, 5), description: "Hegel inverted: dialectical materialism. Capital, Communist Manifesto. The theory that generated the most consequential political genealogy in modern history." },
  { id: "berlin", label: "Isaiah Berlin", layer: 0, pos: t(620, 30), description: "Liberal pluralism as answer to Enlightenment monism. Two Concepts of Liberty: negative vs positive freedom. Specifically designed to counter Marx-Hegel-Lenin tradition. Individualist, sharp." },
  { id: "machiavelli", label: "Machiavelli", layer: 0, pos: t(150, 50), description: "The Prince — realpolitik foundation. Napoleon annotated it as a practitioner engaging with theory. Power as it IS, not as it should be." },
  { id: "bakunin", label: "Bakunin", layer: 0, pos: t(210, 60), description: "Collectivist anarchism. Split with Marx at the First International (1872) — the foundational schism of the left: centralized revolution vs decentralized liberation." },
  { id: "kropotkin", label: "Kropotkin", layer: 0, pos: t(200, 115), description: "Mutual Aid: cooperation, not competition, drives evolution. The anti-Darwinist, anti-Nietzschean position. Anarcho-communism grounded in natural science." },
  { id: "malatesta", label: "Malatesta", layer: 0, pos: t(160, 90), description: "Italian anarchist. Praxis-oriented — less theoretical than Kropotkin or Bakunin, more focused on revolutionary action and organization without authority." },
  { id: "foucault", label: "Foucault", layer: 0, pos: t(80, 220), description: "The Words and Things: structures of knowledge determine what can be thought. Each era has an episteme — a framework that makes certain thoughts literally unthinkable. Deeper archaeology than Fisher's capitalist realism. Panopticon: power operates through visibility, not violence." },
  { id: "ingenieros", label: "Ingenieros", layer: 0, pos: t(70, 340), description: "El hombre mediocre: Nietzschean diagnosis applied to Argentine intellectual culture. The mediocre man never risks, never creates, never overcomes. Aspiration toward the superior individual — more honest about it being aspiration than Rand." },
  { id: "jauretche", label: "Jauretche", layer: 0, pos: t(60, 390), description: "El medio pelo argentino: the Argentine middle class imitates European culture to distinguish itself from popular classes. That imitation IS the mediocrity. Kundera's kitsch applied to social class — ideology operating through taste and habits, not belief." },
  { id: "fisher", label: "Mark Fisher", layer: 0, pos: t(90, 170), description: "Capitalist Realism: easier to imagine the end of the world than the end of capitalism. Not an ideology you believe — an atmosphere you breathe. The slow cancellation of the future. Depression as political condition, not personal pathology. K-punk." },

  // === LAYER 1: IDEAS THROUGH FICTION ===
  { id: "dostoevsky", label: "Dostoevsky", layer: 1, pos: t(420, 145), description: "Full metaphysical crisis — God, freedom, suffering, murder, redemption. Origin node. Demons predicted the revolutionary type. Suffering as constitutive of existence: same diagnosis as Nietzsche, opposite prescription (redemption vs self-overcoming)." },
  { id: "tolstoy", label: "Tolstoy", layer: 1, pos: t(250, 65), description: "Philosophy + history in perfect balance. The smoke at Austerlitz. Also a literal Christian anarchist — corresponded with the movement, influenced Gandhi." },
  { id: "hesse", label: "Hesse", layer: 1, pos: t(555, 45), description: "Bridge between Russian depth and Eastern contemplation. Dostoevsky who meditates." },
  { id: "sartre", label: "Sartre", layer: 1, pos: t(295, 275), description: "Confront the absurd through engagement, commitment, political action." },
  { id: "camus", label: "Camus", layer: 1, pos: t(190, 305), description: "Confront the absurd through revolt, art, living fully. Split with Sartre over political violence." },
  { id: "kundera", label: "Kundera", layer: 1, pos: t(480, 290), description: "Novel as investigation of existence. Lived inside the system Lenin built. Too little meaning: lightness, kitsch, forgetting." },
  { id: "kafka", label: "Kafka", layer: 1, pos: t(365, 370), description: "Methodical documentation of futile search. Institutional labyrinths." },
  { id: "borges", label: "Borges", layer: 1, pos: t(725, 450), description: "Thought experiments in perfect prose. Idea and story inseparable." },
  { id: "sabato", label: "Sabato", layer: 1, pos: t(105, 375), description: "'Poor man's Dostoevsky' — psychological obsession, already knows the answer." },
  { id: "pynchon", label: "Pynchon", layer: 1, pos: t(695, 240), description: "Is the system real or hallucination? Comic Kierkegaard. Lot 49: Shannon entropy, Maxwell's demon, anarchist postal networks, Freud/Jung — four layers operating simultaneously. The digressions ARE the story. Rollercoaster that uses speed changes to make you feel the speed more." },
  { id: "dfw", label: "DFW", layer: 1, pos: t(815, 330), description: "Centripetal — consciousness, addiction, sincerity. Style becomes ethics becomes metaphysics. Kafka's humor essay: funny and horrifying simultaneously. Spotted Nastasya-Caddy structural parallel across traditions. The serious writer must avoid ideology." },
  { id: "orwell", label: "Orwell", layer: 1, pos: t(50, 275), description: "Pain as control. Animal Farm as critique of what Leninism becomes. Spanish Civil War as journalism becoming philosophy." },
  { id: "huxley", label: "Huxley", layer: 1, pos: t(655, 110), description: "Pleasure as control. Dystopia as ambient normalcy." },
  { id: "asimov", label: "Asimov", layer: 1, pos: t(755, 115), description: "Psychohistory = Tolstoy's history as math. Three Laws = constitutional AI. Characters have personality even when subordinated to ideas — Hari Seldon isn't interchangeable." },
  { id: "egan", label: "Egan", layer: 1, pos: t(830, 130), description: "Philosopher of consciousness using fiction. Better ideas than execution." },
  { id: "pkd", label: "Philip K. Dick", layer: 1, pos: t(760, 185), description: "What if reality is fake? Dostoevsky's paranoia in sci-fi." },
  { id: "dazai", label: "Dazai", layer: 1, pos: t(325, 195), description: "Japanese Dostoevsky. Existentialism internalized as self-destruction." },
  { id: "aira", label: "Aira", layer: 1, pos: t(615, 460), description: "Cortazar's energy through Borges's obsessions. Idea outruns the story. Jazz improvisation craft: decades of preparation internalized, then pure forward motion without revision. Duchampian gesture — the fuga hacia adelante makes the publishing system uncertain about itself. Accepts the draft condition Rand refuses. Closure taxonomy (circular return / escape / reality crash) is the structural instinct that maps onto Krasznahorkai's decay taxonomy." },
  { id: "sebald", label: "Sebald", layer: 1, pos: t(295, 490), description: "Meticulous search for truth that keeps dissolving. Philosophy hidden in architecture. Austerlitz: not knowing your past. Emigrants: knowing too much — the pain of leaving and knowing there's nothing to return to. Butterfly motif as memory itself: you capture it, pin it, preserve it, and in preserving it you kill it." },
  { id: "cusk", label: "Cusk", layer: 1, pos: t(380, 525), description: "Surgical precision. Novel as investigation through radical passivity." },
  { id: "rand", label: "Ayn Rand", layer: 1, pos: t(700, 50), description: "Objectivism: rational self-interest as moral absolute. Nietzsche flattened into economics — Ubermensch stripped of ambiguity. Performs kitsch in Kundera's sense: refuses the draft condition, presents finished ideological product. Reads like a political speech, not a novel." },
  { id: "daempoli", label: "Da Empoli", layer: 1, pos: t(100, 310), description: "Modern realpolitik as fiction. Le Mage du Kremlin: power examined from inside the machine. Machiavelli's lineage in contemporary dress." },
  { id: "lenin", label: "Lenin", layer: 1, pos: t(230, 15), description: "Marx's theory -> praxis. The most consequential theory-to-action pipeline in modern history. What happens when philosophy becomes revolution." },
  { id: "krasznahorkai", label: "Krasznahorkai", layer: 1, pos: t(240, 540), description: "A car crash in slow motion with commentary from a philosophy teacher. Long sentences as suffocating atmosphere. Theater of sequential monologues — each consciousness sealed, talking past the others. Towns as laboratories of decay, with a taxonomy: contested acceleration (Resistance — society fights back and every intervention worsens the damage) vs uncontested emptying (Baron Wenckheim — municipal apocalypse, one town removed from the map while the next continues, unnoticed). Biblical scaffolding drained of redemption: Revelation's imagery without salvation. Kenotic structure — the 'fallen stars' (Marika, the Professor) escape the loop through humiliation, not strength; the exodus begins when the social projections shatter. The Pythagorean move: reality as decayed version of a perfect form, which is a direct anti-dialectic strike against historical materialism — the sphere over the dialectic, shape over matter." },
  { id: "goethe", label: "Goethe", layer: 1, pos: t(480, 50), description: "Faust: the bargain template for every Dostoevskian character who trades soul for knowledge. Werther: the first modern novel of consciousness destroying itself. Wrote Werther at 24, caused copycat suicides across Europe, survived the impulse by writing it. The writing was the exit." },
  { id: "mann", label: "Thomas Mann", layer: 1, pos: t(570, 100), description: "Magic Mountain: sanatorium as laboratory where every pre-WWI philosophical position debates through characters. Dostoevsky's method with German precision. Warmer and more ironic than most European contemporaries — the civilizational collapse is also funny and social and alive." },
  { id: "salinger", label: "Salinger", layer: 1, pos: t(880, 280), description: "Nine Stories: Bananafish detonates like Schweblin, Esme is Kundera's contingency in 12 pages, De Daumier-Smith is Hesse in American dress. Holden's hatred of phonies prefigures DFW's sincerity crisis. Then stopped publishing entirely — walked out of the gallery. The most radical withdrawal." },
  { id: "beckett", label: "Beckett", layer: 1, pos: t(250, 350), description: "Waiting for Godot: the absurd stripped to absolute minimum. Two men wait for someone who never comes. Nothing happens. Twice. Language stripped to bone — Hemingway's economy applied to philosophical theater." },
  { id: "marti", label: "Marti", layer: 1, pos: t(30, 430), description: "Cuban poet-revolutionary. Poetry and political action as the same gesture. The writer-revolutionary where literary and political are literally the same person." },
  { id: "galeano", label: "Galeano", layer: 1, pos: t(30, 480), description: "Open Veins of Latin America: foundational text of Latin American anti-imperialism. Journalism becoming literature, history told from the margins. Marx applied to Latin American extraction." },
  // NEW in v7: Morrison
  { id: "morrison", label: "Morrison", layer: 1, pos: t(395, 440), description: "Beloved: slavery trauma as civilizational decay, history as haunting. 124 Bluestone Road is the novel's center of gravity — a house that selects its inhabitants and cannot be separated from them. Supernatural escalation (the ghost, Beloved consuming Sethe, the exorcism) doesn't introduce something new; it makes visible what was always there. Family love (Sethe + Denver + the community arriving at the end) is the positive feedback loop — the only exit from a closed system of damage. Joins Awad and McCarthy in the architecture of 'love that predates the system.'" },
  // NEW in v7: Liu Cixin
  { id: "liucixin", label: "Liu Cixin", layer: 1, pos: t(800, 160), description: "Trilogy completes the picture. Ideas-novelist whose cosmological apparatus does genuine philosophical work — Dark Forest theory as one of the more compelling answers to the Fermi paradox; mass-debt as cosmic ethics in Death's End (every act of survival in a closed system steals from what comes after); dimensional collapse as physics-of-decay. But the plotting reaches for essentialist shortcuts at every scale — gender, civilizational psychology, 'great person' history — to compress centuries of causation into individual choices. Dark Forest is the strongest of the three: one big idea, scaled correctly, with the wallfacer device forcing interiority to matter. Three-Body sets up ambitiously and burns the second half on exposition. Death's End peaks the cosmology and exposes the craft limit: every civilization-ending decision is gendered (Cheng Xin's swordholder failure, Cheng Xin's gravity-wave failure, Cheng Xin's pocket-universe coda — the fish), the same scene staged three times at increasing scale. The pattern is not occasional. The science keeps surprising; the people stop being able to." },

  // === LAYER 2: PURE NOVELISTS ===
  { id: "hemingway", label: "Hemingway", layer: 2, pos: t(105, 485), description: "Hidden existentialism buried under stripped prose. Iceberg theory. Meaning through what he DOESN'T say." },
  { id: "faulkner", label: "Faulkner", layer: 2, pos: t(820, 220), description: "Pyrotechnic but propulsive prose. American landscape. Sound and the Fury: sealed consciousnesses that never converge into understanding — they accumulate into a portrait of collective isolation. Sequential monologues, not dialogue." },
  { id: "steinbeck", label: "Steinbeck", layer: 2, pos: t(870, 420), description: "Hemingway's prose + Faulkner's landscape + Dostoevsky's morality. Arthurian obsession." },
  { id: "stendhal", label: "Stendhal", layer: 2, pos: t(295, 95), description: "The prototype — Red and the Black predates Crime and Punishment. First battle fog at Waterloo." },
  { id: "zweig", label: "Zweig", layer: 2, pos: t(105, 105), description: "'Great moments' theory. Sublime writing. Writers examining how power actually works — Fouche." },
  { id: "murakami", label: "Murakami", layer: 2, pos: t(695, 595), description: "Escapes forward atmospherically. The impossible as ambient condition." },
  { id: "cortazar", label: "Cortazar", layer: 2, pos: t(635, 590), description: "Cronopios — ludic. Casa Tomada: domestic uncanny." },
  { id: "garciamarquez", label: "Garcia Marquez", layer: 2, pos: t(715, 620), description: "Magic realism as communal mythology." },
  { id: "bioycasares", label: "Bioy Casares", layer: 2, pos: t(560, 550), description: "Calm surface, metaphysical trapdoor." },
  { id: "schweblin", label: "Schweblin", layer: 2, pos: t(470, 645), description: "Inherits Casa Tomada. Scalpel. Mundane becoming uninhabitable. Watchmaker craft: every gear load-bearing, nothing decorative. Avoids interviews because the books are more precise than speech — the precision IS the thought." },
  { id: "ogawa", label: "Ogawa", layer: 2, pos: t(605, 665), description: "Things disappear, people forget, everyone adjusts." },
  { id: "saramago", label: "Saramago", layer: 2, pos: t(190, 555), description: "Same density as Sebald but more resistance." },
  { id: "awad", label: "Mona Awad", layer: 2, pos: t(370, 695), description: "Visceral — flood, not scalpel. Rouge: beauty-for-memory exchange as Faustian bargain, exit only through love that predates the system. PhD on fear in fairy tales — uses Gothic architecture (Stoker's blood/mirrors) updated for beauty industry. Insider knowledge makes the horror believable. Gets better with each book." },
  { id: "king", label: "Stephen King", layer: 2, pos: t(295, 745), description: "Domestic horror maximalist. Overlook = Casa Tomada with ghosts. Long Walk is most Hemingway-adjacent." },
  { id: "femalegothic", label: "Female Gothic?", layer: 2, pos: t(225, 725), description: "Unmapped: Angela Carter, Shirley Jackson, Carmen Maria Machado.", isFrontier: true },
  { id: "stoker", label: "Bram Stoker", layer: 2, pos: t(260, 680), description: "Dracula as Gothic origin: blood as medium of exchange, mirrors as unreliable perception, sun as destroyer. Harker's decay = epistemological collapse — the journal fragments, the self can't narrate itself. The victim wants the consumption. The horror is seduction, not force." },
  { id: "lovecraft", label: "Lovecraft", layer: 2, pos: t(180, 680), description: "Cosmic horror: the universe is indifferent, incomprehensible, and hostile. Opposite of Stoker's intimate bodily horror. The terror isn't that something wants you — it's that nothing does. Horror from scale, not proximity." },
  { id: "murata", label: "Murata", layer: 2, pos: t(550, 615), description: "Convenience Store Woman: the outlier who performs normalcy as logistics, not anguish. No hidden authentic self being suppressed — the convenience store IS the authentic self. Horror is entirely in the social reaction. Scripts are explicit where everyone else's are invisible." },
  { id: "mccarthy", label: "McCarthy", layer: 2, pos: t(150, 770), description: "The Road: prose stripped to bone, biblical cadence, no quotation marks. Moral parable, not psychological novel — characters as vessels for questions, not people. The fire as relay: culture, values, love passed forward through carriers who didn't create them. Family as positive feedback loop — the irreducible unit that survives when every system collapses. Total apocalypse where Krasznahorkai's is municipal." },
  { id: "cervantes", label: "Cervantes", layer: 2, pos: t(780, 500), description: "Don Quixote: the origin. First character who confuses fiction and reality. First novel about what stories do to consciousness. The knight errant template that generates Tolkien, Steinbeck's Arthurian obsession, and Pynchon's Oedipa. 400 years later, still the question: is the pattern real or imposed?" },
  { id: "tolkien", label: "Tolkien", layer: 2, pos: t(850, 500), description: "Lord of the Rings: the modern Arthurian quest crystallized. Mythic architecture — moral absolutes, the fellowship, the wasteland crossing. The adventure template that feeds into Star Wars, Steinbeck, and the quest structure underlying half the network." },
  // NEW in v7: Weir
  { id: "weir", label: "Andy Weir", layer: 2, pos: t(880, 175), description: "Project Hail Mary: science fiction as problem-solving procedural, warmth instead of dread. Stronger on science than characterization — same limitation as Liu Cixin, opposite compensation. Where Liu scales to cosmic despair, Weir scales to competent human-alien friendship. The Crichton mold with a pulse." },
  // NEW in v8: qntm
  { id: "qntm", label: "qntm", layer: 2, pos: t(845, 245), description: "There Is No Antimemetic Division: cosmic horror relocated from scale to epistemics. The antimeme is an idea or entity shaped so that cognition cannot retain it — the threat isn't malevolent, it's that the universe is structured such that certain truths slide off the human mind. Grew directly out of qntm's SCP Foundation wiki work (the Antimemetics Division series, SCP-3125), reworked into a fix-up novel, and the seams show: early chapters are premise-delivery, the Marion Wheeler back half is the real writing. Idea canonical, execution competent rather than beautiful — the inverse of the Layer 1 novelists. The genuinely radical move, treating perceptibility as a property of the world's structure rather than the observer's mind, is underused: the book defaults to ontological-but-inaccessible (it all exists on our plane, we just can't hold it) and only brushes true epistemic causation in the back half, when an idea sent into a non-material dimension reaches back to alter reality. The resolution — the machine that is not not a machine, an entity that becomes the idea of itself — is formally earned: a book that trained you to think in negation-space pays off in a double-negative. Sits in Layer 2 because the philosophy is present but not load-bearing; this is a novelist gesturing at a philosophical idea, not building a novel out of one." },
];

const nodeMap = {};
NODES.forEach(n => { nodeMap[n.id] = n; });

const EDGES = [
  // ===== ORIGIN TRIO =====
  { s: "dostoevsky", t: "tolstoy", label: "origin trio", type: "parallel" },
  { s: "dostoevsky", t: "hesse", label: "origin trio", type: "parallel" },
  { s: "tolstoy", t: "hesse", label: "origin trio", type: "parallel" },
  // ===== STENDHAL =====
  { s: "stendhal", t: "dostoevsky", label: "Sorel -> Raskolnikov", type: "genealogy", desc: "1830 prototypes 1866." },
  { s: "stendhal", t: "tolstoy", label: "first battle fog", type: "genealogy", desc: "Fabrice at Waterloo -> Austerlitz smoke." },
  { s: "stendhal", t: "sebald", label: "fog across centuries", type: "parallel" },
  // ===== EXISTENTIALIST CORE =====
  { s: "dostoevsky", t: "sartre", label: "Underground -> Roquentin", type: "genealogy" },
  { s: "sartre", t: "camus", label: "what to DO with absurd", type: "tension", desc: "Engagement vs revolt. Same diagnosis, opposite prescriptions." },
  { s: "sartre", t: "sabato", label: "narrowing scope", type: "genealogy" },
  { s: "dostoevsky", t: "sabato", label: "'poor man's'", type: "genealogy" },
  { s: "heidegger", t: "sartre", label: "existentialist lineage", type: "genealogy" },
  { s: "heidegger", t: "camus", label: "existentialist lineage", type: "genealogy" },
  { s: "kierkegaard", t: "hegel", label: "rebellion against", type: "tension" },
  { s: "hesse", t: "kierkegaard", label: "inward search", type: "parallel" },
  // ===== NIETZSCHE =====
  { s: "nietzsche", t: "dostoevsky", label: "dialectical engagement", type: "dialogue", desc: "Admiration, building on each other, disagreement on prescription (suffering as redemption vs self-overcoming) with deep agreement on diagnosis: bourgeois comfort is a lie, suffering is constitutive. The only psychologist Nietzsche could learn from." },
  { s: "nietzsche", t: "kierkegaard", label: "opposite rebellions", type: "tension" },
  { s: "nietzsche", t: "camus", label: "absurd as affirmation", type: "genealogy" },
  { s: "nietzsche", t: "hesse", label: "Zarathustra <-> Steppenwolf", type: "parallel" },
  { s: "nietzsche", t: "kundera", label: "eternal recurrence", type: "parallel" },
  { s: "nietzsche", t: "han", label: "will to power inverted", type: "genealogy", desc: "Will to power turned inward as self-exploitation." },
  { s: "nietzsche", t: "rand", label: "Ubermensch flattened", type: "tension", desc: "Rand takes the Ubermensch and strips out ambiguity, self-overcoming, amor fati — replaces with rational self-interest. Nietzsche reduced to economics." },
  // ===== HEGEL -> MARX -> ZIZEK =====
  { s: "hegel", t: "marx", label: "inverted dialectics", type: "genealogy", desc: "Marx takes Hegel's dialectics and inverts them: ideas don't drive history, material conditions do. The most consequential philosophical inversion." },
  { s: "marx", t: "zizek", label: "neo-Marxist lineage", type: "genealogy", desc: "Zizek inherits Marx through Lacan — ideology isn't false consciousness, it's structured like enjoyment." },
  { s: "hegel", t: "zizek", label: "deeply Hegelian", type: "genealogy", desc: "Zizek is one of the most committed Hegelians alive. Rehabilitates Hegel against the post-structuralists." },
  { s: "zizek", t: "kierkegaard", label: "written extensively on", type: "parallel", desc: "Zizek engages Kierkegaard seriously — the leap of faith, the suspension of the ethical." },
  { s: "zizek", t: "han", label: "same diagnosis, diff method", type: "tension", desc: "Both diagnose late capitalism's pathologies. Han: the subject exhausts itself (phenomenological, quiet). Zizek: the subject enjoys its exploitation (dialectical, loud). Exhaustion vs surplus enjoyment." },
  { s: "zizek", t: "pkd", label: "ideology as reality glitch", type: "parallel", desc: "Zizek uses Dick's paranoid realities as model for how ideology works — reality itself is the fiction. The Matrix as Zizek's favorite illustration." },
  { s: "zizek", t: "dostoevsky", label: "constant reference", type: "parallel", desc: "Zizek returns to Dostoevsky constantly — the Grand Inquisitor as template for ideological analysis." },
  // ===== MARX CONNECTIONS =====
  { s: "marx", t: "lenin", label: "theory -> praxis", type: "genealogy", desc: "The most consequential theory-to-action pipeline in modern history." },
  { s: "marx", t: "bakunin", label: "First International split", type: "tension", desc: "1872: the foundational schism of the left. Centralized revolution (Marx) vs decentralized liberation (Bakunin). Still generates everything from vanguardism to horizontalism." },
  { s: "marx", t: "berlin", label: "Berlin's target", type: "tension", desc: "Berlin's pluralism specifically answers the danger he saw in Marx-Hegel monism: the idea that there's one correct answer to social organization." },
  { s: "marx", t: "rand", label: "direct opposition", type: "tension", desc: "Collectivism vs individualism at maximum intensity. Each is the other's nightmare." },
  // ===== LENIN =====
  { s: "lenin", t: "dostoevsky", label: "Demons predicted it", type: "parallel", desc: "Dostoevsky's Demons is literally about revolutionary anarchists/nihilists — he saw the type coming before it fully existed." },
  { s: "lenin", t: "orwell", label: "Animal Farm", type: "tension", desc: "Animal Farm is the critique of what Leninism becomes. Revolution eating its children." },
  { s: "lenin", t: "kundera", label: "lived inside the system", type: "parallel", desc: "Kundera lived inside the system Lenin built. The Joke is what happens to irony under Leninist bureaucracy." },
  // ===== ANARCHISTS =====
  { s: "bakunin", t: "tolstoy", label: "anarchist kinship", type: "parallel", desc: "Tolstoy was a literal Christian anarchist. Corresponded with the movement, influenced Gandhi. His late essays are anarchist philosophy." },
  { s: "kropotkin", t: "tolstoy", label: "mutual aid <-> pacifism", type: "parallel", desc: "Both: cooperation over competition, rejection of the state. Different frameworks (scientific vs spiritual), same conclusion." },
  { s: "malatesta", t: "bakunin", label: "anarchist tradition", type: "parallel", desc: "Italian praxis branch of Bakunin's collectivist anarchism." },
  { s: "kropotkin", t: "bakunin", label: "anarchist tradition", type: "parallel" },
  { s: "malatesta", t: "kropotkin", label: "anarchist tradition", type: "parallel" },
  { s: "kropotkin", t: "nietzsche", label: "cooperation vs will", type: "tension", desc: "Mutual Aid is the anti-Nietzschean position: cooperation, not competition, drives evolution." },
  { s: "bakunin", t: "lenin", label: "anarchism vs Bolshevism", type: "tension", desc: "The split that echoes forward: libertarian socialism vs authoritarian socialism." },
  { s: "dostoevsky", t: "bakunin", label: "Demons", type: "parallel", desc: "Dostoevsky's Demons portrays the anarchist-revolutionary type with horrified fascination. Prophecy as novel." },
  // ===== BERLIN =====
  { s: "berlin", t: "orwell", label: "anti-totalitarian liberals", type: "parallel", desc: "Both: anti-totalitarian from a liberal position. Individual consciousness against the system." },
  { s: "berlin", t: "kundera", label: "individual vs system", type: "parallel", desc: "Berlin theorizes what Kundera novelizes: the individual under ideological pressure." },
  { s: "berlin", t: "rand", label: "individualism tension", type: "tension", desc: "Both individualist, but Berlin is pluralist (many valid ways to live) where Rand is dogmatic (one correct way). Nuance vs absolute." },
  // ===== RAND =====
  { s: "rand", t: "dostoevsky", label: "admired, misread", type: "tension", desc: "Rand admired Dostoevsky's characters — the ambition, the intensity. But missed the spiritual dimension entirely, kept only the willfulness." },
  // ===== MACHIAVELLI =====
  { s: "machiavelli", t: "daempoli", label: "realpolitik lineage", type: "genealogy", desc: "Le Mage du Kremlin continues The Prince: power examined from inside, without illusions." },
  { s: "machiavelli", t: "zweig", label: "power biography", type: "parallel", desc: "Both examine how power actually works. Zweig's Fouche IS a Machiavellian study — the survivor who serves every regime." },
  { s: "machiavelli", t: "orwell", label: "understanding power", type: "parallel", desc: "Orwell's analysis of totalitarianism is Machiavellian: interested in the mechanics of power, not the morality." },
  // ===== DA EMPOLI =====
  { s: "daempoli", t: "orwell", label: "political fiction", type: "parallel", desc: "Both: fiction as diagnosis of political systems." },
  { s: "daempoli", t: "kundera", label: "power from inside", type: "parallel", desc: "Both examine what political systems do to individual consciousness — but Da Empoli from the manipulator's perspective." },
  { s: "daempoli", t: "zweig", label: "writers and power", type: "parallel", desc: "Both fascinated by the mechanics of political power. Zweig historically, Da Empoli in present tense." },
  // ===== HAN =====
  { s: "han", t: "heidegger", label: "direct lineage", type: "genealogy" },
  { s: "han", t: "orwell", label: "third control model", type: "tension", desc: "Pain -> pleasure -> self-exploitation." },
  { s: "han", t: "huxley", label: "third control model", type: "tension" },
  { s: "han", t: "kundera", label: "transparency = kitsch", type: "parallel" },
  { s: "han", t: "dfw", label: "exhaustion loops", type: "parallel" },
  { s: "han", t: "sebald", label: "dissolved structures", type: "parallel" },
  // ===== KUNDERA =====
  { s: "dostoevsky", t: "kundera", label: "Gambler <-> Joke", type: "parallel" },
  { s: "kundera", t: "kierkegaard", label: "irony as method", type: "parallel" },
  { s: "kundera", t: "kafka", label: "Central European", type: "parallel" },
  { s: "kundera", t: "tolstoy", label: "compressed + ironic", type: "tension" },
  { s: "kundera", t: "cusk", label: "novel as investigation", type: "parallel" },
  { s: "kundera", t: "hesse", label: "philosophical novel", type: "parallel" },
  { s: "kundera", t: "orwell", label: "totalitarianism", type: "parallel" },
  // ===== KAFKA =====
  { s: "kafka", t: "sebald", label: "same process", type: "parallel" },
  { s: "kafka", t: "dostoevsky", label: "alienation", type: "genealogy" },
  // ===== DAZAI =====
  { s: "dazai", t: "dostoevsky", label: "Japanese branch", type: "genealogy" },
  { s: "dazai", t: "sartre", label: "nihilist existentialism", type: "parallel" },
  { s: "dazai", t: "camus", label: "absurd embodied", type: "parallel" },
  // ===== MURAKAMI/OGAWA =====
  { s: "murakami", t: "garciamarquez", label: "ambient impossible", type: "parallel" },
  { s: "murakami", t: "ogawa", label: "calm acquiescence", type: "parallel" },
  { s: "murakami", t: "aira", label: "escape forward", type: "parallel" },
  // ===== HEMINGWAY =====
  { s: "hemingway", t: "tolstoy", label: "primary rival", type: "tension" },
  { s: "hemingway", t: "camus", label: "flat prose, hidden depth", type: "parallel" },
  { s: "hemingway", t: "sebald", label: "meaning through omission", type: "parallel" },
  { s: "hemingway", t: "cusk", label: "meaning through omission", type: "parallel" },
  { s: "hemingway", t: "dfw", label: "say less vs everything", type: "tension" },
  { s: "hemingway", t: "orwell", label: "Spanish Civil War", type: "parallel" },
  { s: "hemingway", t: "sartre", label: "hidden existentialism", type: "parallel" },
  { s: "hemingway", t: "steinbeck", label: "prose kinship", type: "parallel" },
  // ===== STEINBECK =====
  { s: "steinbeck", t: "faulkner", label: "American landscape", type: "parallel" },
  { s: "steinbeck", t: "dostoevsky", label: "moral architecture", type: "parallel" },
  // ===== ZWEIG =====
  { s: "zweig", t: "tolstoy", label: "anti-Tolstoy", type: "tension" },
  { s: "zweig", t: "dostoevsky", label: "psychological depth", type: "parallel" },
  // ===== ORWELL/HUXLEY =====
  { s: "orwell", t: "camus", label: "political engagement", type: "parallel" },
  { s: "orwell", t: "huxley", label: "pain vs pleasure", type: "tension" },
  { s: "huxley", t: "hesse", label: "mystical turn", type: "parallel" },
  { s: "huxley", t: "murakami", label: "ambient dystopia", type: "parallel" },
  // ===== SCI-FI =====
  { s: "asimov", t: "tolstoy", label: "history as math", type: "parallel" },
  { s: "asimov", t: "zweig", label: "systems vs moments", type: "tension" },
  { s: "asimov", t: "pynchon", label: "hidden systems", type: "parallel" },
  { s: "asimov", t: "huxley", label: "sci-fi worldbuilding", type: "parallel" },
  { s: "asimov", t: "egan", label: "ideas over characters", type: "parallel" },
  { s: "egan", t: "borges", label: "thought experiments", type: "parallel" },
  { s: "egan", t: "heidegger", label: "death made optional", type: "tension" },
  { s: "egan", t: "han", label: "eternal optimization", type: "parallel" },
  { s: "egan", t: "pkd", label: "opposite approaches", type: "tension" },
  { s: "pkd", t: "dostoevsky", label: "paranoia lineage", type: "genealogy" },
  { s: "pkd", t: "kafka", label: "reality dissolving", type: "parallel" },
  { s: "pkd", t: "pynchon", label: "American paranoia", type: "parallel" },
  // ===== PYNCHON =====
  { s: "dostoevsky", t: "pynchon", label: "paranoia branch", type: "divergence" },
  { s: "tolstoy", t: "pynchon", label: "same smoke", type: "parallel" },
  { s: "kierkegaard", t: "pynchon", label: "indirect communication", type: "parallel" },
  { s: "pynchon", t: "faulkner", label: "prose momentum", type: "parallel" },
  { s: "pynchon", t: "dfw", label: "thesis <-> antithesis", type: "tension" },
  { s: "pynchon", t: "sebald", label: "opposite responses", type: "tension" },
  // ===== DFW =====
  { s: "dfw", t: "sartre", label: "consciousness-as-trap", type: "parallel" },
  // ===== SEBALD =====
  { s: "sebald", t: "saramago", label: "flowing prose", type: "parallel" },
  { s: "cusk", t: "sebald", label: "prepared Carlos for", type: "reading_path" },
  { s: "tolstoy", t: "sebald", label: "Austerlitz connection", type: "parallel" },
  // ===== ARGENTINE =====
  { s: "aira", t: "cortazar", label: "ludic energy", type: "genealogy" },
  { s: "aira", t: "borges", label: "conceptual obsessions", type: "genealogy" },
  { s: "borges", t: "bioycasares", label: "collaborators", type: "parallel" },
  { s: "bioycasares", t: "cortazar", label: "mundane -> uncanny", type: "genealogy" },
  { s: "cortazar", t: "schweblin", label: "Casa Tomada -> all", type: "genealogy" },
  { s: "bioycasares", t: "schweblin", label: "gut-punch lineage", type: "genealogy" },
  { s: "garciamarquez", t: "cortazar", label: "boom", type: "parallel" },
  { s: "garciamarquez", t: "borges", label: "fictional worlds", type: "parallel" },
  // ===== HORROR/GOTHIC =====
  { s: "awad", t: "schweblin", label: "visceral kinship", type: "parallel" },
  { s: "awad", t: "garciamarquez", label: "surface resemblance", type: "tension" },
  { s: "awad", t: "femalegothic", label: "possible lineage", type: "frontier_link" },
  { s: "awad", t: "king", label: "maximalist horror", type: "parallel" },
  { s: "king", t: "cortazar", label: "Overlook = Casa Tomada", type: "parallel" },
  { s: "king", t: "hemingway", label: "Long Walk kinship", type: "parallel" },
  { s: "schweblin", t: "kafka", label: "uncanny structures", type: "parallel" },
  { s: "ogawa", t: "schweblin", label: "quiet horror", type: "parallel" },
  // ===== STOKER / LOVECRAFT =====
  { s: "stoker", t: "awad", label: "blood -> beauty exchange", type: "genealogy", desc: "Same Faustian architecture: Dracula takes blood/gives immortality, Rouge takes memory/gives beauty. Victim wants it. Harker's journal fragmentation = Belle's memory loss. Mirrors as unreliable perception. Gothic horror updated for beauty industry." },
  { s: "stoker", t: "king", label: "domestic Gothic", type: "genealogy", desc: "Gothic horror rooted in houses, families, intimate spaces. Dracula's castle -> Overlook Hotel." },
  { s: "stoker", t: "femalegothic", label: "Gothic origin", type: "genealogy", desc: "The lineage from Stoker through female Gothic writers who reclaimed the body-horror tradition." },
  { s: "stoker", t: "lovecraft", label: "paired horror origins", type: "tension", desc: "Intimate/bodily/seductive horror (Stoker) vs cosmic/impersonal/incomprehensible horror (Lovecraft). Two foundational branches of the genre." },
  // ===== KRASZNAHORKAI (v6 edges, descriptions slightly refreshed) =====
  { s: "krasznahorkai", t: "sebald", label: "European ruins", type: "parallel", desc: "Both walk through ruins of European civilization. Sebald whispers and circles. Krasznahorkai screams into them. Sebald is elegy, Krasznahorkai is apocalypse." },
  { s: "krasznahorkai", t: "kafka", label: "institutional decay", type: "parallel", desc: "Both: methodical documentation of systems failing. Kafka's institutions, Krasznahorkai's towns. Bureaucratic absurdity pushed to extremes." },
  { s: "krasznahorkai", t: "dostoevsky", label: "provincial darkness", type: "parallel", desc: "Provincial towns as laboratories for human darkness. The Hungarian town in Melancholy = Dostoevsky's small-town hells. Fascism emerging from ordinary desperation, not ideology." },
  { s: "krasznahorkai", t: "saramago", label: "long flowing prose", type: "parallel", desc: "Both: unpunctuated, relentless sentences. Krasznahorkai more suffocating, Saramago more resistant. Both achieve atmosphere through syntax." },
  { s: "krasznahorkai", t: "kundera", label: "civility as kitsch", type: "parallel", desc: "People maintaining social forms while the world collapses. Paper-thin heaviness: the town keeps functioning, people keep greeting each other, while a rotting whale sits in the square." },
  // ===== MURATA =====
  { s: "murata", t: "ogawa", label: "calm adjustment", type: "parallel", desc: "Both: the world operates strangely, characters adapt without existential crisis. Ogawa's disappearances, Murata's social scripts. Horror is in the acquiescence." },
  { s: "murata", t: "han", label: "scripts as survival", type: "parallel", desc: "Keiko performs achievement-society scripts not from burnout but as survival architecture for a consciousness that can't read social cues naturally. Self-optimization as logistics, not ideology." },
  { s: "murata", t: "camus", label: "outlier indifference", type: "parallel", desc: "Meursault and Keiko: both indifferent to social expectations. Meursault is destroyed for it. Keiko adapts and survives. Different outcomes, same outsider condition." },
  { s: "murata", t: "kafka", label: "performing normalcy", type: "parallel", desc: "Both: characters navigating systems whose rules they can see but not feel. Kafka's protagonists fail at the performance. Keiko succeeds — which is more disturbing." },
  // ===== AWAD NEW CONNECTIONS =====
  { s: "awad", t: "ogawa", label: "memory erasure", type: "parallel", desc: "Memory Police: collective passive erasure, everyone adjusts. Rouge: individual active exchange, beauty for memory. Both arrive at Kundera's lightness — a self technically present but emptied of depth." },
  { s: "awad", t: "han", label: "beauty as self-exploitation", type: "parallel", desc: "Skincare rituals are Han's self-exploitation in practice: voluntary, pleasurable, consuming. Nobody forces the optimization. It feels like freedom. It feels like care." },
  { s: "awad", t: "stoker", label: "Gothic genealogy", type: "genealogy", desc: "Rouge inherits Dracula's full architecture: blood/beauty exchange, mirrors, sun as enemy, the victim wanting the consumption. Updated from aristocratic vampire to beauty industry." },
  // ===== DFW =====
  { s: "dfw", t: "faulkner", label: "Nastasya <-> Caddy", type: "parallel", desc: "DFW spotted the structural parallel: both are absent centers — women who function as black holes of male consciousness. Men orbit, obsess, try to save or possess. The woman remains opaque." },
  { s: "dfw", t: "dostoevsky", label: "Joseph Frank essay", type: "dialogue", desc: "DFW's deepest literary criticism. Style as ethics. The serious writer avoids ideology. Dostoevsky's messy prose IS the moral argument — cleaning it up would make suffering consumable." },
  { s: "dfw", t: "kafka", label: "humor essay", type: "parallel", desc: "DFW argues Americans misread Kafka: humor and horror operate simultaneously in the same sentence. The comedy intensifies rather than relieves the horror. Sisyphus laughing." },
  // ===== PYNCHON =====
  { s: "pynchon", t: "bakunin", label: "anarchist networks", type: "parallel", desc: "Lot 49's Tristero = anarchist postal service, shadow communication beneath official systems. Bakunin's decentralized liberation as paranoid fiction." },
  { s: "pynchon", t: "faulkner", label: "Benjy <-> Oedipa", type: "tension", desc: "Both create disorienting prose but from opposite causes. Benjy: too little cognitive filter, time collapses. Pynchon: too many signals, meaning overloads. Same disorientation, opposite cause." },
  // ===== McCARTHY =====
  { s: "mccarthy", t: "hemingway", label: "prose heir", type: "genealogy", desc: "Closest thing to Hemingway's heir in American prose. Same iceberg method, same refusal to explain, same trust in the reader. But darker — Hemingway hides sadness under precision, McCarthy hides horror." },
  { s: "mccarthy", t: "camus", label: "carrying the fire", type: "parallel", desc: "The father carrying the fire through a dead world IS Sisyphus pushing the boulder. No rational reason to continue. He continues. The absurd as endurance." },
  { s: "mccarthy", t: "king", label: "archetypal vessels", type: "parallel", desc: "Both use characters as vessels for moral/existential propositions, not psychological studies. Long Walk and The Road: people walking forward through landscapes trying to kill them. Endurance as the question." },
  { s: "mccarthy", t: "awad", label: "family as exit", type: "parallel", desc: "Same conclusion through opposite methods. Rouge: hyper-civilization's trap, exit through mother-daughter love. The Road: no civilization at all, same irreducible family unit survives. Love as the positive feedback loop the system can't metabolize." },
  { s: "mccarthy", t: "sebald", label: "unrecoverable past", type: "parallel", desc: "Sebald's emigrants can't go home because home changed. McCarthy's final paragraph: the past wasn't just changed, it was annihilated. Sebald's loss is displacement. McCarthy's is extinction." },
  { s: "mccarthy", t: "han", label: "answer to Han", type: "tension", desc: "Han says the self-exploiting subject is trapped alone. McCarthy and Awad answer: the exit is lateral, toward another person, through a bond the system can't reach. Not optimism — locating the structural weakness in a closed system." },
  { s: "mccarthy", t: "ogawa", label: "world stripped bare", type: "parallel", desc: "Both: worlds where things have been removed. Ogawa removes selectively, people adjust calmly. McCarthy removes everything, survival becomes the only question. Different scales of loss." },
  // ===== CRAFT MODELS =====
  { s: "aira", t: "pynchon", label: "jazz vs symphony", type: "tension", desc: "Two opposite craft models: Aira writes forward without revision (jazz improvisation). Pynchon composes, layers, revises (symphonic orchestration). Both require mastery, located at different points in the process." },
  { s: "aira", t: "schweblin", label: "jazz vs watchmaker", type: "tension", desc: "Both Argentine, opposite methods. Aira: forward momentum, never revise, draft as final form. Schweblin: every word tested against function, nothing decorative. Energy vs precision." },
  // ===== ZIZEK-DFW BEAUTY-TRUTH =====
  { s: "zizek", t: "dfw", label: "beauty = truth trap", type: "parallel", desc: "Zizek: we assign moral weight to aesthetic qualities — beautiful = trustworthy. DFW: Dostoevsky's ugly prose is ethical because it refuses to make suffering consumable. Both identify the same trap: style doing ideology's work silently." },
  { s: "zizek", t: "awad", label: "beauty-truth from inside", type: "parallel", desc: "Zizek theorizes the beauty=goodness=truth equation. Rouge puts you inside someone living that equation — the skincare rituals as daily practice of ideological internalization." },
  // ===== DUCHAMP-PYNCHON-AIRA =====
  { s: "aira", t: "pynchon", label: "Duchamp lineage", type: "parallel", desc: "Both inherit Duchamp's anti-institutional gesture. Pynchon sends a comedian to accept his National Book Award. Aira publishes without revision. Both accept the system's frame while making it unable to function normally. Dadaist disruption from inside." },
  // ===== FOUCAULT =====
  { s: "foucault", t: "han", label: "discipline -> achievement", type: "genealogy", desc: "Foucault mapped the disciplinary society (prison/school/hospital). Han argues we've moved beyond it to self-discipline. The panopticon internalized — you no longer need the watchtower when the subject watches itself." },
  { s: "foucault", t: "zizek", label: "post-structuralist tension", type: "tension", desc: "Both neo-Marxist lineage but Foucault is post-structuralist, Zizek is Hegelian. Genuine methodological disagreement about how power operates." },
  { s: "foucault", t: "fisher", label: "archaeology of limits", type: "genealogy", desc: "Fisher's capitalist realism is Foucault's episteme applied to economics: the framework makes certain thoughts unthinkable. The inability to imagine alternatives isn't failure of imagination — it's how epistemes work." },
  { s: "foucault", t: "pynchon", label: "hidden systems", type: "parallel", desc: "Foucault's panopticon is Pynchon's paranoia made theoretical. Both: power operates through structures you can't see but can feel." },
  { s: "foucault", t: "orwell", label: "surveillance theory", type: "parallel", desc: "1984's telescreen is Foucault's panopticon as fiction. But Foucault goes further: you don't need the telescreen when the subject has internalized the gaze." },
  { s: "foucault", t: "kafka", label: "institutional power", type: "parallel", desc: "Kafka's Castle and Trial are the literary form of Foucault's analysis: institutions that exercise power through procedure, not violence." },
  // ===== FISHER =====
  { s: "fisher", t: "han", label: "parallel diagnoses", type: "parallel", desc: "Both diagnose late capitalism's psychological damage. Fisher names the system explicitly. Han describes living inside it. Fisher: why can't we imagine alternatives? Han: what does the system do to interiority?" },
  { s: "fisher", t: "zizek", label: "critique absorbed", type: "tension", desc: "Both neo-Marxist, both use pop culture diagnostically. But Fisher is darker: Zizek still believes in dialectical rupture. Fisher argues capitalist realism absorbs critique the way it absorbs everything else." },
  { s: "fisher", t: "dfw", label: "depression as political", type: "parallel", desc: "Fisher: depression is privatized suffering, political condition disguised as personal pathology. DFW's entertainment-addiction loop is Fisher's capitalist realism experienced from inside a single consciousness." },
  { s: "fisher", t: "kundera", label: "kitsch as episteme", type: "parallel", desc: "Fisher's 'we can't imagine alternatives' is Kundera's kitsch at maximum: not just denying what doesn't fit the narrative, but eliminating the capacity to conceive of alternatives." },
  { s: "fisher", t: "pynchon", label: "cancelled future", type: "parallel", desc: "Fisher's 'slow cancellation of the future' connects to Pynchon's entropy — both recognize something running down beneath the surface of normalcy." },
  { s: "fisher", t: "awad", label: "realism in a face mask", type: "parallel", desc: "Rouge is Fisher's capitalist realism applied to beauty: the system feels natural, the exploitation feels like care, alternatives are unimaginable." },
  { s: "fisher", t: "mccarthy", label: "end of world easier", type: "parallel", desc: "The Road is literally what Fisher says is easier to imagine than the end of capitalism. McCarthy can write civilizational extinction. Nobody in the network writes the end of the system." },
  // ===== INGENIEROS =====
  { s: "ingenieros", t: "nietzsche", label: "Argentine Nietzsche", type: "genealogy", desc: "El hombre mediocre applies Nietzsche's herd/Ubermensch to Argentine context. Closer to Rand's simplification than Nietzsche's complexity, but more honest about aspiration." },
  { s: "ingenieros", t: "jauretche", label: "Argentine opposites", type: "tension", desc: "Ingenieros: rise above the mediocre (Nietzschean elitism). Jauretche: the imitation of European culture IS the mediocrity (anti-elitist critique). Same Argentine condition, opposite diagnoses." },
  { s: "ingenieros", t: "borges", label: "Argentine intellectual", type: "parallel", desc: "Both represent the cosmopolitan Argentine tradition valuing erudition and originality. Same cultural air." },
  { s: "ingenieros", t: "sabato", label: "idealism collapsed", type: "tension", desc: "Sabato's characters are trapped in obsession, unable to be the superior man Ingenieros describes. El Tunel is what happens when the idealist collapses into solipsism." },
  { s: "ingenieros", t: "camus", label: "refusal of mediocrity", type: "parallel", desc: "Ingenieros's mediocre man is the person who never confronts the absurd. Camus's revolt is the refusal of mediocrity — but Camus rejects hierarchy. The point isn't to be superior, it's to be awake." },
  // ===== JAURETCHE =====
  { s: "jauretche", t: "kundera", label: "kitsch as class", type: "parallel", desc: "Medio pelo is Kundera's kitsch applied to Argentine social class — the performance of European sophistication as denial of local reality." },
  { s: "jauretche", t: "zizek", label: "ideology in habits", type: "parallel", desc: "The middle class doesn't believe in European superiority consciously. They perform it through taste, habits, references. Ideology operating in behavior, not belief." },
  { s: "jauretche", t: "han", label: "self-curation as class", type: "parallel", desc: "Han's transparency society as class performance — medio pelo is self-curation for social positioning." },
  { s: "jauretche", t: "marti", label: "Latin American thought", type: "parallel", desc: "Both diagnosing colonial and neo-colonial structures from inside the experience." },
  { s: "jauretche", t: "galeano", label: "Argentine anti-imperial", type: "parallel", desc: "Same intellectual tradition — Galeano continental, Jauretche specifically Argentine." },
  // ===== GOETHE =====
  { s: "goethe", t: "dostoevsky", label: "Faust template", type: "genealogy", desc: "Faust's bargain is the template for every Dostoevskian character who trades soul for experience. Raskolnikov's murder is a Faustian experiment. Ivan's Grand Inquisitor is Mephistopheles making the case." },
  { s: "goethe", t: "hesse", label: "German lineage", type: "genealogy", desc: "Steppenwolf explicitly references Faust. Harry Haller's crisis is a modern Faustian dilemma — the intellectual who has consumed everything and found it insufficient." },
  { s: "goethe", t: "nietzsche", label: "lived affirmation", type: "parallel", desc: "Nietzsche admired Goethe as one of the few humans who actually lived the affirmation he philosophized about. Faust as proto-Ubermensch." },
  { s: "goethe", t: "mann", label: "German tradition", type: "genealogy", desc: "Mann is Goethe's most self-conscious heir. Doctor Faustus is literally Faust retold as German culture's descent into Nazism." },
  { s: "goethe", t: "dazai", label: "Werther -> No Longer Human", type: "parallel", desc: "Both: young men whose sensitivity becomes the mechanism of destruction. The first modern novel of self-annihilating consciousness (1774) and its Japanese descendant (1948)." },
  { s: "goethe", t: "sabato", label: "draining reads", type: "parallel", desc: "Werther and El Tunel: both obsessive spirals that drain the reader. Same claustrophobic architecture — consciousness as prison." },
  { s: "goethe", t: "camus", label: "opposite responses", type: "tension", desc: "Faust refuses the absurd by seeking total knowledge. Sisyphus accepts the absurd by pushing the rock. Opposite responses to the same recognition." },
  { s: "goethe", t: "awad", label: "Faustian bargain", type: "parallel", desc: "The deep structure underneath Rouge and Dracula. Trade something essential for something desired. The bargain always costs more than advertised. Goethe formalized the template." },
  // ===== MANN =====
  { s: "mann", t: "dostoevsky", label: "philosophical characters", type: "parallel", desc: "Both embody ideas in characters who argue. But Mann is cooler, more controlled — the debates happen over dinner, not in fevered confessions." },
  { s: "mann", t: "hesse", label: "German contemporaries", type: "parallel", desc: "Both dealing with the crisis of European humanism. Hesse turns inward toward Eastern spirituality. Mann stays in the European tradition and watches it consume itself." },
  { s: "mann", t: "tolstoy", label: "civilization in individuals", type: "parallel", desc: "Magic Mountain does in a sanatorium what War and Peace does on a battlefield: uses individual lives to examine forces about to destroy a civilization." },
  { s: "mann", t: "kundera", label: "ironic ideas", type: "parallel", desc: "Both novelists of ideas using irony as structural principle. Present competing philosophies without resolving them. Settembrini-Naphta debate = lightness-weight debate in different clothing." },
  { s: "mann", t: "han", label: "outside productivity", type: "tension", desc: "The sanatorium as space outside productive society. Hans Castorp stops working, just exists. The opposite of Han's achievement society — and Mann presents it as both liberation and decay." },
  // ===== SALINGER =====
  { s: "salinger", t: "hemingway", label: "prose economy", type: "genealogy", desc: "Salinger's economy comes from Hemingway but warmer. Both served in WWII. Hemingway hides the wound under ice. Salinger hides it under tenderness. Bananafish is Hemingway's method applied to psychological damage." },
  { s: "salinger", t: "dazai", label: "Holden <-> Yozo", type: "parallel", desc: "Almost twins: young men who can't participate in social performance. Published within years of each other without either author knowing the other. Same diagnosis from opposite cultures." },
  { s: "salinger", t: "dfw", label: "sincerity crisis", type: "genealogy", desc: "Holden's phonies prefigure DFW's crisis of irony. Both want authenticity and both find that wanting authenticity is itself a performance." },
  { s: "salinger", t: "camus", label: "outsider narrators", type: "parallel", desc: "Meursault and Holden: both unable to perform expected social responses. Meursault is indifferent, Holden cares too much. Same alienation, opposite temperature." },
  { s: "salinger", t: "hesse", label: "Eastern spiritual turn", type: "parallel", desc: "Salinger's later work steeped in Zen and Vedanta. The Glass family are Hesse characters in Manhattan — brilliant, seeking, unable to reconcile knowledge with daily life." },
  { s: "salinger", t: "dostoevsky", label: "intelligence doesn't save", type: "parallel", desc: "The Glass family's collective brilliance doesn't save them from suffering. Same proposition as Dostoevsky: being smart enough to see the problem doesn't solve the problem." },
  { s: "salinger", t: "murata", label: "performing normalcy", type: "tension", desc: "Both: people who can't perform normalcy. Keiko adapts through mimicry and survives. Holden refuses and breaks down. Salinger himself chose the inverse — withdrawal, not adaptation." },
  { s: "salinger", t: "kundera", label: "contingency saves", type: "parallel", desc: "For Esme: a chance meeting in a tea shop before D-Day becomes the thing that saves a life months later. Kundera's architecture — the accidental encounter that turns out to be load-bearing." },
  { s: "salinger", t: "cusk", label: "fragment as person", type: "parallel", desc: "De Daumier-Smith: constructing an entire person from a fragment. The fundamental problem of how we know others. Cusk's Outline is the mature version of what Salinger captures in adolescent form." },
  // ===== BECKETT =====
  { s: "beckett", t: "camus", label: "absurd as theater", type: "parallel", desc: "Sisyphus pushing the boulder is Godot that never arrives. Same proposition in different form — the absurd as condition, not event." },
  { s: "beckett", t: "kafka", label: "waiting without resolution", type: "parallel", desc: "The Castle and Godot are the same condition: the system may have purpose but you'll never know. The waiting IS the experience." },
  { s: "beckett", t: "hemingway", label: "radical economy", type: "parallel", desc: "Both strip language to bone. Hemingway hides meaning under the surface. Beckett removes the surface entirely." },
  { s: "beckett", t: "murata", label: "repetition as meaning", type: "parallel", desc: "Keiko's convenience store routines and Beckett's stage routines: is repetition meaningless or the only meaning available?" },
  // ===== MARTI =====
  { s: "marti", t: "orwell", label: "writer as actor", type: "parallel", desc: "Both: the writer as political actor. Homage to Catalonia and Marti's revolution — pen and action as the same commitment." },
  { s: "marti", t: "camus", label: "engaged rebel", type: "parallel", desc: "The engaged writer, the rebel. Both combine artistic and political commitment without subordinating one to the other." },
  { s: "marti", t: "lenin", label: "theory into praxis", type: "tension", desc: "Both: ideas into action. But Marti through poetry, Lenin through political organization. Fundamentally different methods of revolution." },
  { s: "marti", t: "bakunin", label: "liberation movements", type: "parallel", desc: "Anti-colonial and anti-state — different targets, same libertarian impulse." },
  // ===== GALEANO =====
  { s: "galeano", t: "orwell", label: "journalism as philosophy", type: "parallel", desc: "Same method, different continents. Journalism becoming literature, reporting becoming argument." },
  { s: "galeano", t: "zweig", label: "opposite vantage points", type: "tension", desc: "Both write history as literary narrative. Zweig from European center, Galeano from Latin American periphery. Opposite perspectives on the same global system." },
  { s: "galeano", t: "marx", label: "applied to extraction", type: "genealogy", desc: "Open Veins is essentially Marxist analysis applied to the specific conditions of Latin American resource extraction and colonial exploitation." },
  { s: "galeano", t: "marti", label: "Latin American liberation", type: "parallel", desc: "Same intellectual tradition — the writer as voice of liberation." },
  // ===== CERVANTES =====
  { s: "cervantes", t: "pynchon", label: "pattern real or imposed?", type: "parallel", desc: "Oedipa is a Quixote — she may be imposing a fictional pattern on reality, or reality may actually be that strange. 400 years apart, same question." },
  { s: "cervantes", t: "borges", label: "Pierre Menard", type: "parallel", desc: "Borges wrote explicitly about Quixote — Pierre Menard is about the impossibility of separating text from context. The reader completes the work." },
  { s: "cervantes", t: "kundera", label: "founder of the novel", type: "genealogy", desc: "Kundera cites Cervantes as the founder of the novel as investigation of existence. The tradition begins here." },
  { s: "cervantes", t: "tolkien", label: "quest template", type: "genealogy", desc: "The knight errant structure. Don Quixote -> Arthurian romance -> Lord of the Rings. The adventure template." },
  { s: "cervantes", t: "steinbeck", label: "Arthurian lineage", type: "genealogy", desc: "Steinbeck's Arthurian obsession descends from the same chivalric tradition Cervantes both celebrates and parodies." },
  { s: "cervantes", t: "aira", label: "forward into impossible", type: "parallel", desc: "The fuga hacia adelante is Quixotic — forward into the impossible, reality be damned. Both trust the momentum over the destination." },
  // ===== TOLKIEN =====
  { s: "tolkien", t: "steinbeck", label: "quest structure", type: "parallel", desc: "Grapes of Wrath as fellowship crossing wasteland — both inherit the knight errant template. Joads as hobbits, California as Mordor." },
  { s: "tolkien", t: "dostoevsky", label: "moral architecture", type: "tension", desc: "Both build absolute moral architectures. But Dostoevsky's characters contain contradictions — they argue both sides. Tolkien's moral landscape is clean: good is good, evil is evil. Different kinds of seriousness." },
  { s: "tolkien", t: "hesse", label: "quest as spiritual journey", type: "parallel", desc: "Siddhartha and Frodo are on the same journey in different clothing. The quest as structure for spiritual transformation." },

  // =====================================================================
  // ===== NEW in v7: KRASZNAHORKAI (Baron Wenckheim completion) =====
  // =====================================================================
  { s: "krasznahorkai", t: "mccarthy", label: "municipal vs total apocalypse", type: "tension", desc: "McCarthy writes the apocalypse as total — the whole world is ash. Krasznahorkai writes it as municipal — one town collapses into meaninglessness while the next continues, unnoticed. Terrifying precisely because plausible: it's already happening in depopulated towns across Hungary, Argentina, the American Midwest." },
  { s: "krasznahorkai", t: "faulkner", label: "sequential monologues", type: "parallel", desc: "Sound and the Fury does this at the scale of a family — Benjy, Quentin, Jason each a sealed consciousness. Krasznahorkai scales it to a town. Everyone is talking but nobody is listening; perspectives don't converge into understanding, they accumulate into a portrait of collective isolation." },
  { s: "krasznahorkai", t: "beckett", label: "Godot at a train station", type: "parallel", desc: "The Baron's arrival is Godot: the town gathers to receive meaning from a figure who refuses to deliver it. The waiting is the apparatus; the failure of arrival is the content." },
  { s: "krasznahorkai", t: "marx", label: "geometry beats dialectics", type: "tension", desc: "Krasznahorkai weaponizes pre-Socratic geometry — reality as degraded version of the sphere — against historical materialism. Marx inverts Plato through Hegel: matter over form. Krasznahorkai re-inverts: the perfect form was real, what remains is the material decay proving it was either never reachable or long abandoned. Anti-dialectic strike that hits Leninism harder than any liberal argument." },
  { s: "krasznahorkai", t: "hegel", label: "anti-dialectical", type: "tension", desc: "Where Hegel has history as dialectical progression toward freedom, Krasznahorkai has history as indifferent decay. No synthesis, no Aufhebung — just the same car crash in slow motion across different towns." },
  { s: "krasznahorkai", t: "aira", label: "taxonomies of closure/decay", type: "dialogue", desc: "Both produce structural taxonomies from the same instinct. Aira's closure taxonomy: circular return, escape, reality crash. Krasznahorkai's decay taxonomy: contested acceleration (Resistance), uncontested emptying (Baron Wenckheim), and whatever Satantango will turn out to offer. Companion frameworks — original contributions." },
  { s: "krasznahorkai", t: "goethe", label: "kenotic inversion", type: "parallel", desc: "The Baron is Faust hollowed out — the great figure who arrives carrying nothing. Marika and the Professor are the unnoticed ones who escape through humiliation, not strength. Kenotic structure: salvation through self-emptying, not conquering." },
  { s: "krasznahorkai", t: "fisher", label: "provinces of cancelled future", type: "parallel", desc: "Fisher's slow cancellation of the future rendered at town scale. The future didn't get dystopian — it just stopped arriving. The Baron's promise of return is what cancelled futures look like when they announce themselves." },

  // =====================================================================
  // ===== NEW in v7: MORRISON =====
  // =====================================================================
  { s: "morrison", t: "krasznahorkai", label: "haunted acceleration", type: "parallel", desc: "Both start grounded and end in full supernatural/religious confrontation. The escalation doesn't introduce something new — it makes visible what was always there. 124 Bluestone and the Hungarian town are both haunted from page one; the apparatus just takes that long to surface." },
  { s: "morrison", t: "awad", label: "selective spaces", type: "parallel", desc: "Places that select their inhabitants: 124 Bluestone traps and is trapped by Sethe; the spa in Rouge seduces Belle back. The architecture has agency. The victim is implicated in the consumption." },
  { s: "morrison", t: "mccarthy", label: "family as exit", type: "parallel", desc: "Sethe and Denver and the community at the end; the father and son on the road. Same structural conclusion through opposite methods: love as the positive feedback loop the closed system can't metabolize. Rouge, The Road, and Beloved triangulate the same answer." },
  { s: "morrison", t: "sebald", label: "unrecoverable past", type: "parallel", desc: "Both: the past can't be returned to because it was destroyed, not just left behind. Sebald's emigrants; Sethe's Sweet Home. Memory as haunting, not recovery." },
  { s: "morrison", t: "dostoevsky", label: "moral weight", type: "parallel", desc: "Beloved is Dostoevskian in the weight it gives to a single past act. Sethe's choice has the density of Raskolnikov's axe — the rest of the novel is the self trying to metabolize what it did." },
  { s: "morrison", t: "fisher", label: "no outside to imagine", type: "parallel", desc: "Slavery as the ur-example of Fisher's thesis: a system so total that alternatives become literally unthinkable inside it. Beloved is what capitalist realism looks like when the capital is human flesh." },
  { s: "morrison", t: "faulkner", label: "Southern Gothic", type: "genealogy", desc: "Morrison inherits and rewrites Faulkner's South — same landscape, same hauntings, but with the perspective Faulkner structurally couldn't write. Absalom, Absalom's architecture put to different work." },

  // =====================================================================
  // ===== NEW in v7: LIU CIXIN =====
  // =====================================================================
  { s: "liucixin", t: "asimov", label: "essentialism vs contingent rules", type: "tension", desc: "Both build architectures and stress-test them — Asimov ethical (Three Laws), Liu cosmological (Dark Forest). The deeper split is the causal substrate: Asimov tests contingent rules built by humans for humans; Liu reaches for fixed essences (gender, civilizational psychology, 'feminized era produces weak humanity') to drive plot. Asimov's characters carry personality through the ideas — Hari Seldon isn't interchangeable. Liu's get reduced to type so the ideas can scale, and by Death's End the reduction is the plot." },
  { s: "liucixin", t: "krasznahorkai", label: "localized apocalypse pushed cosmic", type: "parallel", desc: "Krasznahorkai's localized apocalypse pushed to cosmic limit. In Baron Wenckheim a town collapses while the world continues unaware; in Death's End every civilization vanishes the same way, and by the trilogy's end the universe itself contracts because each small act of preservation steals from the future. Mass-debt as cosmic ethics — Krasznahorkai's structure made into physical law." },
  { s: "liucixin", t: "fisher", label: "escapism = cancelled future", type: "parallel", desc: "The Escapism movement and the fatalism about a threat four centuries away is structurally identical to climate discourse: a confirmed existential threat on a timeline long enough that each generation argues it's the next one's problem. Fisher's slow cancellation rendered as plot." },
  { s: "liucixin", t: "dostoevsky", label: "Grand Inquisitor arrived at vs told", type: "tension", desc: "Book one argues humanity doesn't deserve freedom — structurally the same claim as Ivan's Grand Inquisitor. But Dostoevsky makes you arrive at the conclusion; Liu tells you Ye Wenjie reached it. Same proposition, different psychological execution." },
  { s: "liucixin", t: "pynchon", label: "compressed essence vs emergent pattern", type: "divergence", desc: "Same problem, opposite method. Both stage civilizational-scale hidden systems where reality is more structured and hostile than it appears. But Liu derives those systems from compressed essentialist causation — gender, civilizational psychology, dark-forest game theory operating as fixed law. Pynchon stages them as emergent pattern that may or may not be there at all, where paranoia is the epistemology rather than the answer. Game theory as truth vs paranoia as method." },
  { s: "liucixin", t: "pkd", label: "physics as reality glitch", type: "parallel", desc: "The sophon unfolding into extra dimensions, physics itself compromised — that's Dick's paranoid metaphysics rewritten as hard SF. What if the laws themselves were the adversary?" },
  { s: "liucixin", t: "weir", label: "ideas novelist split", type: "tension", desc: "Both ideas-first, prose-second. But Liu compensates for thin characterization with scale and dread; Weir compensates with warmth and humor. Opposite emotional registers covering the same craft limitation." },
  { s: "liucixin", t: "morrison", label: "essentialism vs irreducibility", type: "tension", desc: "Opposite uses of the supernatural relative to essentialism. Morrison's ghost makes visible what was always structural — Sethe's choice cannot be reduced to maternal essence, which is precisely why Beloved must arrive as an irreducible presence. Liu's plotting goes the other way: Cheng Xin's choices ARE reducible to maternal essence, and the supernatural (sophons, dimensional weapons) is deployed as exit ramp from psychology rather than as its irreducible remainder. Where Morrison forces complexity, Liu forces simplification." },

  // =====================================================================
  // ===== NEW in v7: WEIR =====
  // =====================================================================
  { s: "weir", t: "asimov", label: "competent protagonist", type: "parallel", desc: "The scientist-protagonist solving the puzzle. Asimov's method as paperback thriller: problem, research, setback, ingenuity, result. Hari Seldon's descendants as working engineers." },
  { s: "weir", t: "egan", label: "rigor vs reach", type: "tension", desc: "Both prize scientific rigor; Egan reaches for metaphysics, Weir stays with survival. Same calibration instrument pointed at different questions." },

  // =====================================================================
  // ===== NEW in v8: QNTM =====
  // =====================================================================
  { s: "qntm", t: "ogawa", label: "structural vs imposed forgetting", type: "tension", desc: "Two opposite engines of erasure. Ogawa's disappearances are imposed by an external authority — slow, bureaucratic, mourned; the loss is felt. qntm's antimemes have no author and aren't necessarily hostile — they're simply shaped so cognition can't retain them, so the loss can't even be registered as loss. Imposed-and-mourned vs structural-and-unmournable." },
  { s: "qntm", t: "egan", label: "ideas over execution, mind as object", type: "parallel", desc: "Nearest neighbor on craft and subject. Both do philosophy of mind through ideas-first SF where the concept outruns the prose — Egan on consciousness and identity, qntm on memory and perceptibility. 'Better ideas than execution' applies verbatim to both. The difference is depth of commitment: Egan builds the novel out of the philosophy; qntm brushes it." },
  { s: "qntm", t: "lovecraft", label: "cosmic horror, relocated to epistemics", type: "genealogy", desc: "Inherits Lovecraft's core move — horror from an indifferent universe rather than a malevolent agent — and relocates it from spatial scale to cognition. Lovecraft: the universe is too vast and uncaring to perceive you. qntm: the universe is structured so that you are built wrong to perceive it. Dread from structure, not proximity, in both." },
  { s: "qntm", t: "liucixin", label: "concept-forward SF, opposite scaling", type: "tension", desc: "Both ideas-first, prose-second SF where the premise does the lifting. But they scale in opposite directions: Liu outward to cosmological despair (dark forest, dimensional collapse), qntm inward to the limits of cognition (what a mind can hold). Same family, inverse vector — civilization-scale dread vs perception-scale dread." },
];

const EDGE_COLORS = {
  genealogy: "#c42040",
  parallel: "#1a7a8a",
  tension: "#b8860b",
  divergence: "#2d8a4e",
  reading_path: "#6a5acd",
  frontier_link: "#b8860b",
  dialogue: "#8b2fc9",
};
const EDGE_DASHES = { tension: true, reading_path: true, frontier_link: true };

const EDGE_TYPE_LABELS = [
  ["genealogy", "Lineage"],
  ["parallel", "Kinship"],
  ["tension", "Tension"],
  ["divergence", "Divergent"],
  ["dialogue", "Dialogue"],
  ["reading_path", "Reading"],
  ["frontier_link", "Frontier"],
];

// Build adjacency for BFS pathfinding
const ADJACENCY = {};
NODES.forEach(n => { ADJACENCY[n.id] = []; });
EDGES.forEach(e => {
  if (ADJACENCY[e.s] && ADJACENCY[e.t]) {
    ADJACENCY[e.s].push({ to: e.t, edge: e });
    ADJACENCY[e.t].push({ to: e.s, edge: e });
  }
});

function findShortestPath(startId, endId, activeTypes) {
  if (!startId || !endId || startId === endId) return null;
  const visited = new Set([startId]);
  const queue = [[startId, []]];
  while (queue.length) {
    const [cur, path] = queue.shift();
    const neighbors = ADJACENCY[cur] || [];
    for (const { to, edge } of neighbors) {
      if (visited.has(to)) continue;
      if (activeTypes && !activeTypes.has(edge.type)) continue;
      const newPath = [...path, { from: cur, to, edge }];
      if (to === endId) return newPath;
      visited.add(to);
      queue.push([to, newPath]);
    }
  }
  return null;
}

export default function LiteraryNetwork3D() {
  const containerRef = useRef(null);
  const labelRef = useRef(null);
  const threeRef = useRef({});
  const orbitRef = useRef({ theta: 0.4, phi: 0.65, radius: 580, target: new THREE.Vector3(0, 150, 0) });
  const dragRef = useRef({ active: false, lx: 0, ly: 0 });
  const autoRef = useRef({ rotating: true, timer: null });

  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTypes, setActiveTypes] = useState(new Set(EDGE_TYPE_LABELS.map(([t]) => t)));
  const [pathMode, setPathMode] = useState(false);
  const [pathStart, setPathStart] = useState(null);
  const [pathEnd, setPathEnd] = useState(null);

  const selectedRef = useRef(null);
  const hoveredRef = useRef(null);
  const activeTypesRef = useRef(activeTypes);
  const pathRef = useRef(null);
  const pathModeRef = useRef(false);
  const pathEndpointsRef = useRef({ start: null, end: null });

  useEffect(() => { selectedRef.current = selected; }, [selected]);
  useEffect(() => { hoveredRef.current = hovered; }, [hovered]);
  useEffect(() => { activeTypesRef.current = activeTypes; }, [activeTypes]);
  useEffect(() => { pathModeRef.current = pathMode; }, [pathMode]);

  // compute path
  const path = useMemo(() => {
    if (!pathMode || !pathStart || !pathEnd) return null;
    return findShortestPath(pathStart, pathEnd, activeTypes);
  }, [pathMode, pathStart, pathEnd, activeTypes]);

  useEffect(() => { pathRef.current = path; }, [path]);
  useEffect(() => { pathEndpointsRef.current = { start: pathStart, end: pathEnd }; }, [pathStart, pathEnd]);

  // Search matches
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return NODES.filter(n => n.label.toLowerCase().includes(q)).slice(0, 8);
  }, [searchQuery]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const w = container.clientWidth, h = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f0);
    scene.fog = new THREE.FogExp2(0xf5f5f0, 0.0005);

    const camera = new THREE.PerspectiveCamera(50, w / h, 1, 2500);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x999999, 0.8));
    const lights = [[0x1a7a8a, 0, -50, 200], [0xc42040, 0, 150, -200], [0xb8860b, 0, 350, 100]];
    lights.forEach(([c, x, y, z]) => { const l = new THREE.PointLight(c, 0.6, 900); l.position.set(x, y, z); scene.add(l); });

    LAYER_META.forEach(lm => {
      const g = new THREE.GridHelper(600, 24, lm.gridColor, lm.gridColor);
      g.position.y = lm.y; g.material.transparent = true; g.material.opacity = 0.25; scene.add(g);
    });

    const meshes = {};
    const meshToId = new Map();
    const sGeo = new THREE.SphereGeometry(5.5, 16, 12);
    const smGeo = new THREE.SphereGeometry(3.5, 12, 8);

    NODES.forEach(node => {
      const lm = LAYER_META[node.layer];
      const color = new THREE.Color(lm.color);
      const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.15, metalness: 0.2, roughness: 0.4, transparent: true, opacity: 1 });
      const mesh = new THREE.Mesh(node.isFrontier ? smGeo : sGeo, mat);
      mesh.position.set(node.pos[0], lm.y, node.pos[1]);
      scene.add(mesh); meshes[node.id] = mesh; meshToId.set(mesh, node.id);
    });

    const edgeLines = [];
    EDGES.forEach(edge => {
      const sm = meshes[edge.s], tm = meshes[edge.t];
      if (!sm || !tm) return;
      const c = new THREE.Color(EDGE_COLORS[edge.type] || "#444");
      const geo = new THREE.BufferGeometry().setFromPoints([sm.position, tm.position]);
      const mat = new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: EDGE_DASHES[edge.type] ? 0.25 : 0.35 });
      const line = new THREE.Line(geo, mat);
      scene.add(line); edgeLines.push({ line, edge, mat });
    });

    threeRef.current = { scene, camera, renderer, meshes, meshToId, edgeLines };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const allMeshes = Object.values(meshes);

    const updateCamera = () => {
      const o = orbitRef.current;
      const phi = Math.max(0.15, Math.min(Math.PI - 0.15, o.phi));
      camera.position.set(
        o.target.x + o.radius * Math.sin(phi) * Math.sin(o.theta),
        o.target.y + o.radius * Math.cos(phi),
        o.target.z + o.radius * Math.sin(phi) * Math.cos(o.theta)
      );
      camera.lookAt(o.target);
    };

    const updateLabels = () => {
      const lc = labelRef.current; if (!lc) return;
      const labels = lc.children;
      const sel = selectedRef.current;
      const types = activeTypesRef.current;
      const currentPath = pathRef.current;
      const { start: pStart, end: pEnd } = pathEndpointsRef.current;

      const pathNodeIds = new Set();
      if (currentPath) {
        pathNodeIds.add(pStart);
        currentPath.forEach(step => pathNodeIds.add(step.to));
      }

      const conIds = new Set();
      if (sel) EDGES.forEach(e => {
        if (!types.has(e.type)) return;
        if (e.s === sel || e.t === sel) { conIds.add(e.s); conIds.add(e.t); }
      });

      for (let i = 0; i < NODES.length; i++) {
        const node = NODES[i], mesh = meshes[node.id], el = labels[i];
        if (!mesh || !el) continue;
        const v = mesh.position.clone().project(camera);
        const x = (v.x * 0.5 + 0.5) * w, y = (-v.y * 0.5 + 0.5) * h;
        const behind = v.z > 1;
        const depth = Math.max(0, Math.min(1, v.z));
        let opacity = behind ? 0 : Math.max(0.12, 1 - depth * 2.5);
        let scale = behind ? 0 : Math.max(0.55, 1.1 - depth);
        let fw = "500";
        if (currentPath && pathNodeIds.size) {
          if (pathNodeIds.has(node.id)) { opacity = 1; scale = 1.2; fw = "700"; }
          else { opacity = 0.05; scale *= 0.7; }
        } else if (sel) {
          if (node.id === sel) { opacity = 1; scale = 1.2; fw = "700"; }
          else if (conIds.has(node.id)) { opacity = Math.min(opacity, 0.85); }
          else { opacity = 0.04; scale *= 0.75; }
        } else if (pathModeRef.current && (pStart === node.id || pEnd === node.id)) {
          opacity = 1; scale = 1.2; fw = "700";
        }
        if (hoveredRef.current === node.id && !sel && !currentPath) { opacity = 1; scale = 1.15; fw = "700"; }
        el.style.transform = `translate(-50%,-50%) translate(${x}px,${y - 13 * scale}px) scale(${scale})`;
        el.style.opacity = opacity; el.style.fontWeight = fw;
      }
    };

    const updateEdges = () => {
      const sel = selectedRef.current;
      const types = activeTypesRef.current;
      const currentPath = pathRef.current;
      const pathEdgeSet = new Set();
      if (currentPath) currentPath.forEach(s => pathEdgeSet.add(s.edge));

      edgeLines.forEach(({ mat, edge }) => {
        const typeActive = types.has(edge.type);
        const baseOpacity = EDGE_DASHES[edge.type] ? 0.25 : 0.35;
        if (currentPath) {
          mat.opacity = pathEdgeSet.has(edge) ? 0.95 : 0.03;
        } else if (sel) {
          if (!typeActive) { mat.opacity = 0.02; }
          else if (edge.s === sel || edge.t === sel) { mat.opacity = 0.8; }
          else { mat.opacity = 0.04; }
        } else {
          mat.opacity = typeActive ? baseOpacity : 0.02;
        }
      });
    };

    const updateNodes = () => {
      const sel = selectedRef.current, hov = hoveredRef.current;
      const types = activeTypesRef.current;
      const currentPath = pathRef.current;
      const { start: pStart, end: pEnd } = pathEndpointsRef.current;

      const pathNodeIds = new Set();
      if (currentPath) {
        pathNodeIds.add(pStart);
        currentPath.forEach(step => pathNodeIds.add(step.to));
      }

      const conIds = new Set();
      if (sel) EDGES.forEach(e => {
        if (!types.has(e.type)) return;
        if (e.s === sel || e.t === sel) { conIds.add(e.s); conIds.add(e.t); }
      });

      NODES.forEach(node => {
        const mesh = meshes[node.id]; if (!mesh) return;
        const mat = mesh.material;
        if (currentPath) {
          if (pathNodeIds.has(node.id)) {
            const isEndpoint = node.id === pStart || node.id === pEnd;
            mat.emissiveIntensity = isEndpoint ? 0.6 : 0.35;
            mat.opacity = 1;
            mesh.scale.setScalar(isEndpoint ? 1.6 : 1.25);
          } else {
            mat.emissiveIntensity = 0.03; mat.opacity = 0.08; mesh.scale.setScalar(0.55);
          }
        } else if (sel) {
          if (node.id === sel) { mat.emissiveIntensity = 0.4; mat.opacity = 1; mesh.scale.setScalar(1.5); }
          else if (conIds.has(node.id)) { mat.emissiveIntensity = 0.25; mat.opacity = 0.9; mesh.scale.setScalar(1.1); }
          else { mat.emissiveIntensity = 0.05; mat.opacity = 0.1; mesh.scale.setScalar(0.6); }
        } else if (pathModeRef.current && (pStart === node.id || pEnd === node.id)) {
          mat.emissiveIntensity = 0.55; mat.opacity = 1; mesh.scale.setScalar(1.5);
        } else {
          mat.emissiveIntensity = hov === node.id ? 0.4 : 0.15;
          mat.opacity = 1; mesh.scale.setScalar(hov === node.id ? 1.3 : 1);
        }
      });
    };

    let running = true;
    const animate = () => {
      if (!running) return;
      requestAnimationFrame(animate);
      if (autoRef.current.rotating) orbitRef.current.theta += 0.0015;
      updateCamera(); updateLabels(); updateEdges(); updateNodes();
      renderer.render(scene, camera);
    };
    animate();

    const onDown = e => { dragRef.current = { active: true, lx: e.clientX, ly: e.clientY }; autoRef.current.rotating = false; clearTimeout(autoRef.current.timer); };
    const onMove = e => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(allMeshes);
      const hitId = hits.length > 0 ? meshToId.get(hits[0].object) : null;
      if (hitId !== hoveredRef.current) { setHovered(hitId); renderer.domElement.style.cursor = hitId ? "pointer" : "grab"; }
      if (!dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.lx, dy = e.clientY - dragRef.current.ly;
      orbitRef.current.theta -= dx * 0.005;
      orbitRef.current.phi = Math.max(0.15, Math.min(Math.PI - 0.15, orbitRef.current.phi + dy * 0.005));
      dragRef.current.lx = e.clientX; dragRef.current.ly = e.clientY;
      renderer.domElement.style.cursor = "grabbing";
    };
    const onUp = () => { dragRef.current.active = false; autoRef.current.timer = setTimeout(() => { autoRef.current.rotating = true; }, 4000); };
    const onClk = e => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(allMeshes);
      if (hits.length > 0) {
        const id = meshToId.get(hits[0].object);
        if (pathModeRef.current) {
          // path mode: click sets start, then end
          const ep = pathEndpointsRef.current;
          if (!ep.start) { setPathStart(id); }
          else if (!ep.end && id !== ep.start) { setPathEnd(id); }
          else {
            // reset, start over
            setPathStart(id); setPathEnd(null);
          }
        } else {
          setSelected(p => p === id ? null : id);
        }
      } else {
        if (!pathModeRef.current) setSelected(null);
      }
    };
    const onWheel = e => {
      e.preventDefault();
      orbitRef.current.radius = Math.max(200, Math.min(1000, orbitRef.current.radius + e.deltaY * 0.5));
      autoRef.current.rotating = false; clearTimeout(autoRef.current.timer);
      autoRef.current.timer = setTimeout(() => { autoRef.current.rotating = true; }, 4000);
    };
    const onResize = () => {
      const nw = container.clientWidth, nh = container.clientHeight;
      camera.aspect = nw / nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh);
    };

    const el = renderer.domElement;
    el.addEventListener("pointerdown", onDown); el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp); el.addEventListener("pointerleave", onUp);
    el.addEventListener("click", onClk); el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", onResize);

    return () => {
      running = false; clearTimeout(autoRef.current.timer);
      el.removeEventListener("pointerdown", onDown); el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp); el.removeEventListener("pointerleave", onUp);
      el.removeEventListener("click", onClk); el.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      renderer.dispose(); if (container.contains(el)) container.removeChild(el);
    };
  }, []);

  // Handle search-triggered selection
  const jumpToNode = (id) => {
    setSearchQuery("");
    if (pathMode) {
      if (!pathStart) setPathStart(id);
      else if (!pathEnd && id !== pathStart) setPathEnd(id);
      else { setPathStart(id); setPathEnd(null); }
    } else {
      setSelected(id);
    }
  };

  const toggleType = (type) => {
    setActiveTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const togglePathMode = () => {
    setPathMode(pm => {
      const next = !pm;
      if (next) { setSelected(null); }
      else { setPathStart(null); setPathEnd(null); }
      return next;
    });
  };

  const resetPath = () => { setPathStart(null); setPathEnd(null); };

  const selNode = selected ? nodeMap[selected] : null;
  const selEdges = selected
    ? EDGES.filter(e => (e.s === selected || e.t === selected) && activeTypes.has(e.type))
    : [];

  // Group selected edges by type
  const groupedEdges = useMemo(() => {
    const groups = {};
    selEdges.forEach(edge => {
      if (!groups[edge.type]) groups[edge.type] = [];
      groups[edge.type].push(edge);
    });
    const order = ["genealogy", "dialogue", "parallel", "tension", "divergence", "reading_path", "frontier_link"];
    return order.filter(t => groups[t]).map(t => ({ type: t, edges: groups[t] }));
  }, [selEdges]);

  const stats = { l0: NODES.filter(n => n.layer === 0).length, l1: NODES.filter(n => n.layer === 1).length, l2: NODES.filter(n => n.layer === 2).length, e: EDGES.length };

  const typeLabelLookup = Object.fromEntries(EDGE_TYPE_LABELS);

  return (
    <div style={{ background: "#f5f5f0", minHeight: "100vh", fontFamily: "'Inter','SF Pro',-apple-system,sans-serif", color: "#2a2a2a", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "12px 18px 6px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 19, fontWeight: 700, color: "#c42040", margin: 0, letterSpacing: "-0.5px" }}>Literary Network — 3D <span style={{ fontSize: 10, color: "#999", fontWeight: 500, marginLeft: 6 }}>v7</span></h1>
          <p style={{ fontSize: 10.5, color: "#888", margin: "3px 0 0" }}>
            {stats.l0} philosophers · {stats.l1} philosophical novelists · {stats.l2} pure novelists · {stats.e} connections
          </p>
        </div>

        {/* Search + Path Mode */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="find a node…"
              style={{
                padding: "5px 9px", fontSize: 11, border: "1px solid #ccc", borderRadius: 4,
                background: "#fff", width: 140, outline: "none", fontFamily: "inherit",
              }}
            />
            {searchResults.length > 0 && (
              <div style={{
                position: "absolute", top: "100%", left: 0, marginTop: 2, background: "#fff",
                border: "1px solid #ddd", borderRadius: 4, width: 160, zIndex: 10,
                boxShadow: "0 4px 10px rgba(0,0,0,0.08)", maxHeight: 220, overflowY: "auto",
              }}>
                {searchResults.map(n => (
                  <div
                    key={n.id}
                    onClick={() => jumpToNode(n.id)}
                    style={{
                      padding: "5px 9px", fontSize: 11, cursor: "pointer",
                      borderLeft: `3px solid ${LAYER_META[n.layer].color}`,
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f5f5f0"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                  >
                    <span>{n.label}</span>
                    <span style={{ fontSize: 8, color: "#aaa", textTransform: "uppercase" }}>
                      {["Phil", "Idea", "Novel"][n.layer]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={togglePathMode}
            style={{
              padding: "5px 10px", fontSize: 11, cursor: "pointer",
              border: pathMode ? "1px solid #6a5acd" : "1px solid #ccc",
              background: pathMode ? "#6a5acd" : "#fff",
              color: pathMode ? "#fff" : "#555",
              borderRadius: 4, fontFamily: "inherit", fontWeight: 500,
            }}
            title="Click two nodes to trace the shortest connection between them"
          >
            {pathMode ? "✓ path mode" : "path"}
          </button>
          {pathMode && (pathStart || pathEnd) && (
            <button
              onClick={resetPath}
              style={{
                padding: "5px 8px", fontSize: 10, cursor: "pointer",
                border: "1px solid #ccc", background: "#fff", color: "#888",
                borderRadius: 4, fontFamily: "inherit",
              }}
            >reset</button>
          )}
        </div>
      </div>

      {/* Layer + Edge type legend (clickable) */}
      <div style={{ padding: "0 18px 8px", display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        {LAYER_META.map((lm, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: lm.color }} />
            <span style={{ fontSize: 9.5, color: "#666" }}>{lm.label}</span>
          </div>
        ))}
        <div style={{ height: 10, width: 1, background: "#ddd" }} />
        {EDGE_TYPE_LABELS.map(([type, label]) => {
          const active = activeTypes.has(type);
          const c = EDGE_COLORS[type];
          return (
            <div
              key={type}
              onClick={() => toggleType(type)}
              style={{
                display: "flex", alignItems: "center", gap: 4, cursor: "pointer",
                opacity: active ? 1 : 0.35,
                transition: "opacity 0.15s",
              }}
              title={active ? `hide ${label.toLowerCase()}` : `show ${label.toLowerCase()}`}
            >
              <svg width={12} height={4}><line x1={0} y1={2} x2={12} y2={2} stroke={c} strokeWidth={2} strokeDasharray={EDGE_DASHES[type] ? "3,2" : "none"}/></svg>
              <span style={{ fontSize: 9, color: "#888", userSelect: "none" }}>{label}</span>
            </div>
          );
        })}
      </div>

      {/* Path mode hint / status */}
      {pathMode && (
        <div style={{ padding: "5px 18px", fontSize: 10.5, color: "#6a5acd", background: "#f0eefa", borderTop: "1px solid #e0dcef" }}>
          {!pathStart && "click first node…"}
          {pathStart && !pathEnd && <>start: <b>{nodeMap[pathStart]?.label}</b> · click second node…</>}
          {pathStart && pathEnd && path && (
            <>
              <b>{nodeMap[pathStart]?.label}</b> → <b>{nodeMap[pathEnd]?.label}</b> · {path.length} step{path.length === 1 ? "" : "s"}
            </>
          )}
          {pathStart && pathEnd && !path && (
            <>
              no path between <b>{nodeMap[pathStart]?.label}</b> and <b>{nodeMap[pathEnd]?.label}</b> under active edge types
            </>
          )}
        </div>
      )}

      {/* 3D Canvas */}
      <div style={{ position: "relative", flex: 1, minHeight: 520 }}>
        <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: 520, cursor: "grab" }} />
        <div ref={labelRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "hidden" }}>
          {NODES.map(node => (
            <div key={node.id} style={{
              position: "absolute", top: 0, left: 0, fontSize: 9.5,
              color: LAYER_META[node.layer].color,
              textShadow: "0 0 4px #f5f5f0, 0 0 8px #f5f5f0, 0 0 12px #f5f5f0, 0 0 16px #f5f5f0",
              whiteSpace: "nowrap", letterSpacing: "0.3px",
              fontStyle: node.isFrontier ? "italic" : "normal",
              transition: "opacity 0.15s",
            }}>{node.label}</div>
          ))}
        </div>
        <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: "#bbb", pointerEvents: "none" }}>
          drag to orbit · scroll to zoom · click nodes
        </div>
      </div>

      {/* Path result panel */}
      {pathMode && path && path.length > 0 && (
        <div style={{ padding: "10px 18px", background: "#fff", borderTop: "1px solid #e0dcef" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <div style={{ fontSize: 11, color: "#6a5acd", fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>SHORTEST PATH</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {path.map((step, i) => {
                const c = EDGE_COLORS[step.edge.type] || "#444";
                const fromNode = nodeMap[step.from];
                const toNode = nodeMap[step.to];
                return (
                  <div key={i} style={{ padding: "5px 9px", borderLeft: `3px solid ${c}`, background: "#fafaf5", fontSize: 11 }}>
                    <span style={{ color: LAYER_META[fromNode.layer].color, fontWeight: 600 }}>{fromNode.label}</span>
                    <span style={{ color: c, margin: "0 6px" }}>→</span>
                    <span style={{ color: LAYER_META[toNode.layer].color, fontWeight: 600 }}>{toNode.label}</span>
                    {step.edge.label && <span style={{ color: "#999", marginLeft: 8, fontSize: 10 }}>· {step.edge.label}</span>}
                    {step.edge.desc && <p style={{ fontSize: 10, color: "#666", margin: "3px 0 0", lineHeight: 1.4 }}>{step.edge.desc}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Node info panel (grouped by edge type) */}
      {selNode && !pathMode && (
        <div style={{ padding: "12px 18px", background: "#fff", borderTop: `1px solid ${LAYER_META[selNode.layer].color}30` }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: LAYER_META[selNode.layer].color }} />
              <h2 style={{ fontSize: 14, fontWeight: 700, color: LAYER_META[selNode.layer].color, margin: 0 }}>{selNode.label}</h2>
              <span style={{ fontSize: 9, color: "#999", textTransform: "uppercase", letterSpacing: 1 }}>{LAYER_META[selNode.layer].label}</span>
              <span style={{ fontSize: 9, color: "#bbb", marginLeft: "auto" }}>{selEdges.length} connection{selEdges.length === 1 ? "" : "s"}</span>
            </div>
            <p style={{ fontSize: 12, color: "#555", margin: "0 0 10px", lineHeight: 1.5 }}>{selNode.description}</p>

            {groupedEdges.length > 0 && (
              <div style={{ maxHeight: 260, overflowY: "auto", paddingRight: 4 }}>
                {groupedEdges.map(({ type, edges }) => {
                  const c = EDGE_COLORS[type];
                  const typeLabel = typeLabelLookup[type] || type;
                  return (
                    <div key={type} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                        <svg width={12} height={4}><line x1={0} y1={2} x2={12} y2={2} stroke={c} strokeWidth={2} strokeDasharray={EDGE_DASHES[type] ? "3,2" : "none"}/></svg>
                        <span style={{ fontSize: 9, color: c, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{typeLabel}</span>
                        <span style={{ fontSize: 9, color: "#bbb" }}>{edges.length}</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {edges.map((edge, i) => {
                          const otherId = edge.s === selected ? edge.t : edge.s;
                          const other = nodeMap[otherId];
                          return (
                            <div
                              key={i}
                              onClick={() => setSelected(otherId)}
                              style={{
                                padding: "5px 9px", background: "#f8f8f5", borderRadius: 5,
                                borderLeft: `3px solid ${c}`, flex: "1 1 260px", minWidth: 180,
                                cursor: "pointer", transition: "background 0.12s",
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = "#f0f0ea"}
                              onMouseLeave={e => e.currentTarget.style.background = "#f8f8f5"}
                            >
                              <span style={{ fontSize: 10.5, fontWeight: 600, color: LAYER_META[other?.layer || 0].color }}>→ {other?.label}</span>
                              {edge.label && <span style={{ fontSize: 8.5, color: "#999", marginLeft: 5 }}>{edge.label}</span>}
                              {edge.desc && <p style={{ fontSize: 10, color: "#666", margin: "2px 0 0", lineHeight: 1.3 }}>{edge.desc}</p>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
