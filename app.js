/* ==========================================================================
   VERITAS ADVANCED FAKE NEWS DETECTION ENGINE - SYSTEM LOGIC
   ========================================================================= */

// 1. NLP Constants & Feature Extraction Registries

// Stopwords list to filter out common functional words during tokenization
const STOPWORDS = new Set([
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at", 
    "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", 
    "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", 
    "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", 
    "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", 
    "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", 
    "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", 
    "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", 
    "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", 
    "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", 
    "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", 
    "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", 
    "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"
]);

// Standard linear weight terms (representing log-odds log-likelihood weights in client NLP model)
const MODEL_WEIGHTS = {
    // Fake News / Clickbait Indicators (Positive values increase fake probability)
    "shocking": 2.5,
    "unbelievable": 2.2,
    "miracle": 2.0,
    "conspiracy": 2.8,
    "exposed": 1.9,
    "secret": 1.8,
    "hiding": 1.5,
    "scandal": 1.6,
    "mainstream": 1.7,
    "elite": 1.4,
    "elites": 1.6,
    "illuminati": 3.0,
    "aliens": 2.5,
    "truth": 0.6, 
    "hidden": 1.4,
    "proven": 1.1,
    "cured": 1.8,
    "urgent": 1.5,
    "alert": 1.3,
    "mindblowing": 2.4,
    "banned": 2.0,
    "censored": 2.2,
    "arrested": 0.8,
    "breaking": 0.5,
    "clones": 2.8,
    "microchip": 2.5,
    "microchips": 2.5,
    "woke": 1.2,
    "hoax": 1.5,
    "fake": 1.0,
    "scam": 1.6,
    "gullible": 1.8,
    "insider": 1.3,
    "anonymous": 1.1,
    "bunker": 1.4,
    "classified": 1.8,
    "viral": 1.2,
    "omg": 2.6,
    "guaranteed": 1.4,
    
    // Real News Indicators (Negative values decrease fake probability)
    "reuters": -2.8,
    "associated": -2.2,
    "press": -1.5,
    "spokesman": -2.5,
    "spokesperson": -2.6,
    "spokeswoman": -2.4,
    "official": -1.8,
    "officials": -1.6,
    "confirmed": -1.7,
    "statement": -1.9,
    "announced": -2.0,
    "legislation": -2.4,
    "parliament": -2.5,
    "congress": -2.2,
    "senate": -2.1,
    "representative": -1.8,
    "reported": -1.9,
    "reporting": -1.5,
    "minister": -2.0,
    "president": -0.8,
    "governor": -1.4,
    "department": -1.8,
    "agency": -1.6,
    "negotiations": -2.0,
    "accordance": -1.7,
    "published": -1.2,
    "journal": -1.5,
    "university": -1.4,
    "researchers": -1.3,
    "scientist": -1.0,
    "scientific": -1.2,
    "study": -1.1,
    "tuesday": -1.8,
    "wednesday": -1.8,
    "thursday": -1.8,
    "friday": -1.8,
    "monday": -1.8,
    "saturday": -1.5,
    "sunday": -1.5,
    "according": -1.6,
    "declined": -1.5,
    "comment": -1.2,
    "administration": -1.5,
    "coalition": -1.8,
    "treaty": -2.2,
    "bilateral": -2.5,
    "ratify": -1.9
};

// Sensationalism / Clickbait Phrases dictionary for direct substring matching
const CLICKBAIT_PHRASES = [
    "you won't believe", "shocking truth", "secret they don't want you", "miracle cure", 
    "share this before it's deleted", "mind-blowing", "proven to be", "classified bunker",
    "mainstream media is hiding", "anonymous insider", "absolute truth", "cured all diseases"
];

// Lexicon of highly subjective / emotive adjectives mapping directly to tone evaluation
const SUBJECTIVE_ADJECTIVES = new Set([
    "extraordinary", "miraculous", "spectacular", "groundbreaking", "stunning", "triumphant", 
    "phenomenal", "thrilled", "disastrous", "horrible", "catastrophic", "devastating", "outrageous", 
    "evil", "disgraceful", "shameful", "glorious", "terrible", "amazing", "horrific", "unbelievable",
    "corrupt", "brainwashed", "mysterious"
]);

// Global Source Trust Directories
const SOURCE_DIRECTORY = {
    // Verified Outlets (Credible)
    verified: new Set([
        "reuters.com", "apnews.com", "bbc.com", "bbc.co.uk", "bloomberg.com", 
        "nytimes.com", "wsj.com", "npr.org", "theguardian.com"
    ]),
    // Satire Platforms
    satire: new Set([
        "theonion.com", "clickhole.com", "babylonbee.com", "newsthump.com"
    ]),
    // Identified Clickbait/Low Credibility
    disinfo: new Set([
        "infowars.com", "naturalnews.com", "breitbart.com", "worldnewsdailyreport.com", 
        "dailybuzz.live", "activistpost.com"
    ])
};

// High-Fidelity Test Examples for Quick Dashboard Initialization
const EXAMPLES = {
    ap: {
        title: "Global Leaders Announce New Climate Accord",
        text: "Officials from seventy countries met on Thursday to ratify the new bilateral environmental treaty. The spokesperson announced that the administration confirmed its commitment to lowering carbon emissions by thirty percent over the next decade. In a statement published by the agency, negotiators declined to comment on specific tariff adjustments but emphasized that the bilateral accord represents a milestone in international cooperation. A representative reported that the parliament is expected to vote on the legislation next Tuesday, according to the official agenda.",
        domain: "apnews.com",
        views: 18000,
        shares: 420,
        comments: 180,
        likes: 1200
    },
    conspiracy: {
        title: "SHOCKING SECRET EXPOSED: Microchips Curing Diseases Hidden by Elites!!!",
        text: "OMG! A shocking secret has just been exposed by an anonymous insider! Scientists have proven that microchips and clones are curing all diseases, but the corrupt mainstream media is hiding the miracle truth from you! This mindblowing technology was banned and censored by the woke elites who want to keep us sick. A miracle cure is absolute and guaranteed, but they are hiding it in a classified bunker! Urgent! Read this must-read alert and share this absolute mindblowing truth before it is deleted and censored forever!!!",
        domain: "dailybuzz.live",
        views: 3200,
        shares: 6800,
        comments: 25,
        likes: 11000
    },
    satire: {
        title: "Area Man Constantly Reminding Everyone That He Does Not Watch Mainstream Media",
        text: "A local citizen has made it his primary life mission to notify coworkers, family, and casual acquaintances that he has completely disconnected from the mainstream media. According to sources, the man spends six hours a day researching alternative theories online to prove he is not gullible like the rest of the public. 'They are all brainwashed,' he announced while drinking a coffee, referencing a mysterious YouTube video as his primary scientific study. Colleagues confirmed that his constant warnings have become a daily staple of office small talk.",
        domain: "theonion.com",
        views: 52000,
        shares: 7400,
        comments: 2400,
        likes: 28000
    }
};

// 2. Base Application State & Tab Navigation
let currentTab = "tab-detector-section";

function switchTab(tabId) {
    document.querySelectorAll(".tab-content").forEach(el => {
        el.classList.remove("active");
    });
    document.querySelectorAll(".nav-item").forEach(el => {
        el.classList.remove("active");
    });

    document.getElementById(tabId).classList.add("active");
    
    // Set matching Nav item as active
    let navBtnId = "nav-detector";
    if (tabId === "tab-scorecard-section") navBtnId = "nav-scorecard";
    if (tabId === "tab-sandbox-section") navBtnId = "nav-sandbox";
    document.getElementById(navBtnId).classList.add("active");

    currentTab = tabId;
    
    // Proactively refresh sandbox visuals if opening sandbox tab
    if (tabId === "tab-sandbox-section") {
        runSandboxUpdate();
    }
}

// Slider label updating
function updateSliderVal(sliderType) {
    const slider = document.getElementById(`slide-${sliderType}`);
    const display = document.getElementById(`val-${sliderType}`);
    let val = parseFloat(slider.value);
    
    if (val >= 1000) {
        display.innerText = (val / 1000).toFixed(1) + "k";
    } else {
        display.innerText = val.toString();
    }
}

// Load Pre-configured Examples
function loadExample(key) {
    const ex = EXAMPLES[key];
    if (!ex) return;

    document.getElementById("input-title").value = ex.title;
    document.getElementById("input-text").value = ex.text;
    document.getElementById("input-domain").value = ex.domain;

    document.getElementById("slide-views").value = ex.views;
    document.getElementById("slide-shares").value = ex.shares;
    document.getElementById("slide-comments").value = ex.comments;
    document.getElementById("slide-likes").value = ex.likes;

    // Sync displays
    updateSliderVal("views");
    updateSliderVal("shares");
    updateSliderVal("comments");
    updateSliderVal("likes");

    // Automatically trigger tab switch to detector panel & execute scan
    switchTab("tab-detector-section");
    runAnalysis();
}


// 3. NLP Utility Helpers

// Syllable Counter Helper (Heuristics rules engine for English syllables)
function countSyllables(word) {
    word = word.toLowerCase().trim();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const vowels = word.match(/[aeiouy]{1,2}/g);
    return vowels ? vowels.length : 1;
}

// String Domain Parser (extracts basic standard domain like reuters.com from full URL input)
function parseDomain(urlStr) {
    if (!urlStr) return "";
    let domain = urlStr.trim().toLowerCase();
    domain = domain.replace(/^(https?:\/\/)?(www\.)?/, "");
    domain = domain.split("/")[0];
    return domain;
}


// 4. Feature Extraction & Prediction Pipeline
function calculateCredibility(title, text, domainStr, views, shares, comments, likes) {
    // A. Text processing & structural properties
    const combinedText = (title + " " + text).trim();
    if (combinedText.length < 15) {
        return null; // Insufficient content
    }

    const sentences = combinedText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = combinedText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").split(/\s+/).filter(w => w.length > 0);
    const totalWordsCount = words.length || 1;
    const totalSentencesCount = sentences.length || 1;

    // Estimate total syllables for Flesch Readability calculation
    let totalSyllables = 0;
    words.forEach(w => {
        totalSyllables += countSyllables(w);
    });

    // Flesch Reading Ease Formula calculation
    let fleschEase = 206.835 - 1.015 * (totalWordsCount / totalSentencesCount) - 84.6 * (totalSyllables / totalWordsCount);
    fleschEase = Math.max(0, Math.min(100, fleschEase)); // Clamped 0 - 100

    // Lexical Diversity calculation (TTR: Type-Token Ratio)
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const lexicalDiversity = totalWordsCount > 5 ? (uniqueWords.size / totalWordsCount) : 0.8;

    // B. Stylometrics (Sensationalism scoring)
    // 1. CAPS evaluation
    let capsWords = 0;
    const commonAcronyms = new Set(["USA", "UK", "UN", "EU", "NATO", "WHO", "FBI", "CIA", "NASA", "AP", "OM", "OMG"]);
    words.forEach(w => {
        if (w.length > 1 && w === w.toUpperCase() && !commonAcronyms.has(w) && isNaN(w)) {
            capsWords++;
        }
    });
    const capsRatio = capsWords / totalWordsCount;

    // 2. Screaming Punctuation evaluation
    const exclamationMatches = combinedText.match(/!/g) || [];
    const questionMatches = combinedText.match(/\?/g) || [];
    const punctuationRatio = (exclamationMatches.length + questionMatches.length) / totalWordsCount;
    
    // Multiple duplicate punctuation flag (e.g. "!!!" or "!?!")
    const screamingPuncCount = (combinedText.match(/[!?]{2,}/g) || []).length;

    // 3. Clickbait & Subjective tags count
    let clickbaitMatches = 0;
    const lowerText = combinedText.toLowerCase();
    CLICKBAIT_PHRASES.forEach(phrase => {
        if (lowerText.includes(phrase)) {
            clickbaitMatches += 2.5; // High weight bump
        }
    });

    let subjectiveCount = 0;
    words.forEach(w => {
        if (SUBJECTIVE_ADJECTIVES.has(w.toLowerCase())) {
            subjectiveCount++;
        }
    });
    const subjectiveRatio = subjectiveCount / totalWordsCount;

    // Synthesize Sensationalism index (0 - 100 scale)
    let sensationalismIndex = (capsRatio * 200) + (punctuationRatio * 300) + (screamingPuncCount * 12) + (clickbaitMatches * 15) + (subjectiveRatio * 150);
    sensationalismIndex = Math.min(100, Math.max(0, sensationalismIndex));

    // C. Model Log-odds Weight evaluation (Local ML Sigmoid Logit)
    let vocabLogit = 0;
    let matchedKeywords = []; // to output in the chart
    
    const wordFreq = {};
    words.forEach(w => {
        const lw = w.toLowerCase();
        wordFreq[lw] = (wordFreq[lw] || 0) + 1;
    });

    Object.keys(wordFreq).forEach(word => {
        if (STOPWORDS.has(word)) return;
        
        if (MODEL_WEIGHTS.hasOwnProperty(word)) {
            const wWeight = MODEL_WEIGHTS[word];
            // Normalized term frequency: (frequency / total words) * 100
            const tfNorm = (wordFreq[word] / totalWordsCount) * 100;
            const contribution = wWeight * tfNorm;
            
            vocabLogit += contribution;
            matchedKeywords.push({
                word: word,
                weight: wWeight,
                contribution: contribution
            });
        }
    });

    // D. Social Engagement Anomaly evaluation
    // Blind Share Index (BSI)
    const bsi = shares / (comments + 1);
    // Amplification Rate (AR) relative to views
    const ampRate = (shares + likes) / (views + 1);

    let anomalyLogit = 0;
    let anomalySeverity = 0; // 0 - 100%
    
    // standard anomaly boundaries:
    if (bsi > 10) {
        anomalyLogit += (bsi - 10) * 0.15;
    }
    if (ampRate > 0.3) {
        anomalyLogit += (ampRate - 0.3) * 3;
    }
    
    // Cap positive penalty contribution
    anomalyLogit = Math.min(4.5, anomalyLogit);
    anomalySeverity = Math.min(100, Math.max(0, (bsi * 4) + (ampRate * 120)));

    // E. Source Reputation checks
    const domain = parseDomain(domainStr);
    let sourceLogit = 0;
    let sourceCategory = "neutral";
    let sourceRating = 50; // Neutral 50%

    if (domain) {
        if (SOURCE_DIRECTORY.verified.has(domain)) {
            sourceLogit = -4.0; // Strong negative weight decreases fake probability
            sourceCategory = "verified";
            sourceRating = 98;
        } else if (SOURCE_DIRECTORY.satire.has(domain)) {
            sourceCategory = "satire";
            sourceRating = 45;
        } else if (SOURCE_DIRECTORY.disinfo.has(domain)) {
            sourceLogit = 3.5; // Strong positive weight pushes towards fake classification
            sourceCategory = "disinfo";
            sourceRating = 12;
        } else {
            // Unregistered domain check for suspicious extensions
            if (domain.endsWith(".co") || domain.endsWith(".xyz") || domain.endsWith(".su") || domain.endsWith(".info")) {
                sourceLogit = 1.0;
                sourceRating = 35;
            }
        }
    }

    // F. Synthesize final Logit (z) & Classify
    // Baseline model intercept/bias set to slightly favor real (-0.8 bias)
    const intercept = -0.8;
    
    // Lexical diversity modifier: lower diversity increases probability of fake content
    const diversityPenalty = lexicalDiversity < 0.45 ? ((0.45 - lexicalDiversity) * 2.5) : 0;
    
    // Stylometrics logit modifier
    const styleLogit = (sensationalismIndex / 100) * 2.5;

    // Total Log-odds Logit
    let totalLogit = intercept + vocabLogit + styleLogit + sourceLogit + anomalyLogit + diversityPenalty;
    
    // Feed through Logistic Activation (Sigmoid)
    const pFake = 1 / (1 + Math.exp(-totalLogit));
    
    // Calculate final Trust Score
    let trustIndex = (1 - pFake) * 100;
    
    // Special handling for Satire classification
    let classification = "Neutral";
    if (sourceCategory === "satire") {
        classification = "Satire / Parody";
        trustIndex = 50; // Satire sits in a safe, non-journalistic neutral classification
    } else {
        if (trustIndex >= 90) {
            classification = "Verified / Credible";
        } else if (trustIndex >= 70) {
            classification = "Credible / Minor Sensationalism";
        } else if (trustIndex >= 40) {
            classification = "Suspicious / Clickbait";
        } else {
            classification = "High-Risk Disinformation";
        }
    }

    return {
        score: Math.round(trustIndex),
        logit: totalLogit,
        pFake: pFake,
        classification: classification,
        metrics: {
            sensationalism: Math.round(sensationalismIndex),
            readability: Math.round(fleschEase),
            readabilityGrade: getReadingGrade(fleschEase),
            lexicalDiversity: Math.round(lexicalDiversity * 100),
            sourceRating: sourceRating,
            sourceCategory: sourceCategory,
            anomalySeverity: Math.round(anomalySeverity),
            bsi: bsi.toFixed(2),
            ampRate: Math.round(ampRate * 100)
        },
        wordContributions: matchedKeywords.sort((a,b) => Math.abs(b.contribution) - Math.abs(a.contribution)),
        textMap: generateTextMarkup(title, text)
    };
}

// Reading Ease score descriptor lookup
function getReadingGrade(score) {
    if (score >= 90) return "5th Grade (Very Easy)";
    if (score >= 80) return "6th Grade (Easy)";
    if (score >= 70) return "7th Grade (Fairly Easy)";
    if (score >= 60) return "8th-9th Grade (Plain English)";
    if (score >= 50) return "10th-12th Grade (Fairly Difficult)";
    if (score >= 30) return "College Academic";
    return "College Graduate (Extremely Complex)";
}

// Generate highlight markers inside text mapping pane
function generateTextMarkup(title, text) {
    const combined = title + "\n\n" + text;
    let wordsArr = combined.split(/(\s+)/); // Keep whitespace chunks for perfect rebuild
    
    let htmlMarkup = "";
    
    wordsArr.forEach(chunk => {
        if (chunk.trim().length === 0) {
            htmlMarkup += chunk.replace(/\n/g, "<br>");
            return;
        }

        // Clean punctuation for word lookup
        let wordClean = chunk.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "");
        let wordLower = wordClean.toLowerCase();

        // Check Caps screaming
        let isCaps = wordClean.length > 1 && wordClean === wordClean.toUpperCase() && isNaN(wordClean);
        // Check clickbait vocab matching
        let isClickbait = MODEL_WEIGHTS.hasOwnProperty(wordLower) && MODEL_WEIGHTS[wordLower] > 1.2;
        // Check subjective tag
        let isSubjective = SUBJECTIVE_ADJECTIVES.has(wordLower);

        if (isClickbait) {
            htmlMarkup += `<mark class="hl-clickbait" title="Suspicious Word (Weight: +${MODEL_WEIGHTS[wordLower].toFixed(1)})">${chunk}</mark>`;
        } else if (isSubjective) {
            htmlMarkup += `<mark class="hl-subjective" title="Emotional / Subjective Adjective">${chunk}</mark>`;
        } else if (isCaps) {
            htmlMarkup += `<mark class="hl-grammar" title="ALL-CAPS screaming emphasis">${chunk}</mark>`;
        } else {
            htmlMarkup += chunk;
        }
    });

    return htmlMarkup;
}


// 5. Dashboard Core Update Routines
function runAnalysis() {
    const title = document.getElementById("input-title").value.trim();
    const text = document.getElementById("input-text").value.trim();
    const domain = document.getElementById("input-domain").value.trim();

    // Get engagement metrics values
    const views = parseInt(document.getElementById("slide-views").value);
    const shares = parseInt(document.getElementById("slide-shares").value);
    const comments = parseInt(document.getElementById("slide-comments").value);
    const likes = parseInt(document.getElementById("slide-likes").value);

    if (!title || !text) {
        alert("Please enter both an article title and text to execute the scanning engine.");
        return;
    }

    const report = calculateCredibility(title, text, domain, views, shares, comments, likes);
    if (!report) {
        alert("Text content is too short. Please enter a longer article to analyze features.");
        return;
    }

    // Render Tab 1: Credibility Circle Gauge & Verdict Badge
    const scoreVal = document.getElementById("credibility-score-val");
    const gaugeFill = document.getElementById("gauge-fill-elem");
    const verdictBadge = document.getElementById("verdict-badge-elem");
    const verdictLabel = document.getElementById("verdict-label");
    const verdictDesc = document.getElementById("verdict-summary-desc");

    scoreVal.innerText = report.score + "%";

    // Set gauge dash array stroke offset
    // Circumference = 2 * Math.PI * 50 = 314.16
    const offset = 314.16 - (314.16 * report.score) / 100;
    gaugeFill.style.strokeDashoffset = offset;

    // Reset gauge color classifications
    gaugeFill.className.baseVal = "gauge-fill";
    verdictBadge.className = "verdict-badge";

    if (report.classification.includes("Satire")) {
        gaugeFill.classList.add("gauge-satire");
        verdictBadge.classList.add("bg-satire");
        verdictDesc.innerText = "This content stems from a confirmed Satirical/Parody source. It is published for humor or critique, not journalistic facts.";
    } else if (report.score >= 90) {
        gaugeFill.classList.add("gauge-credible");
        verdictBadge.classList.add("bg-credible");
        verdictDesc.innerText = "Highly credible journalistic profile. Employs reputable reporting standards, citation cues, and displays healthy organic discussions.";
    } else if (report.score >= 70) {
        gaugeFill.classList.add("gauge-credible");
        verdictBadge.classList.add("bg-credible");
        verdictDesc.innerText = "Credible overall with minor sensational styling or stylistic clickbait highlights. Lexical structure suggests reliable source base.";
    } else if (report.score >= 40) {
        gaugeFill.classList.add("gauge-warning");
        verdictBadge.classList.add("bg-warning");
        verdictDesc.innerText = "Elevated risk profile. Features clickbait vocabulary triggers, subjective assertions, and anomalous viral share rates.";
    } else {
        gaugeFill.classList.add("gauge-danger");
        verdictBadge.classList.add("bg-danger");
        verdictDesc.innerText = "High threat classification. Dense concentration of disinformation signals, intense capitalization, and extremely anomalous engagement levels.";
    }
    
    verdictLabel.innerText = report.classification;

    // Update Highlight Map Panel
    document.getElementById("highlighted-content-view").innerHTML = report.textMap;


    // Render Tab 2: Detailed Scorecard
    // Sensationalism Index
    document.getElementById("val-sensationalism").innerText = report.metrics.sensationalism + "%";
    document.getElementById("bar-sensationalism").style.width = report.metrics.sensationalism + "%";
    document.getElementById("desc-sensationalism").innerText = 
        report.metrics.sensationalism > 60 ? "CRITICAL: Intense sensational phrasing and caps shouting detected." : "NORMAL: Tone is factual and matches typical journalistic integrity levels.";

    // Readability
    document.getElementById("val-readability").innerText = report.metrics.readability;
    document.getElementById("bar-readability").style.width = report.metrics.readability + "%";
    document.getElementById("desc-readability").innerText = "Grade: " + report.metrics.readabilityGrade + ` // Lexical Variety: ${report.metrics.lexicalDiversity}%`;

    // Domain trust
    document.getElementById("val-domain").innerText = report.metrics.sourceRating + "%";
    document.getElementById("bar-domain").style.width = report.metrics.sourceRating + "%";
    if (report.metrics.sourceCategory === "verified") {
        document.getElementById("desc-domain").innerText = "VERIFIED OUTLET: Highly credible press credentials confirmed.";
    } else if (report.metrics.sourceCategory === "satire") {
        document.getElementById("desc-domain").innerText = "SATIRE: Registered parody platform.";
    } else if (report.metrics.sourceCategory === "disinfo") {
        document.getElementById("desc-domain").innerText = "WARNING: Recognized outlet for deceptive content propagation.";
    } else {
        document.getElementById("desc-domain").innerText = domain ? `UNVERIFIED DOMAIN: '${domain}' lacks verified journalism records.` : "NO DOMAIN: Lacks source identity cues.";
    }

    // Viral Anomaly
    document.getElementById("val-anomaly").innerText = report.metrics.anomalySeverity + "%";
    document.getElementById("bar-anomaly").style.width = report.metrics.anomalySeverity + "%";
    document.getElementById("desc-anomaly").innerText = 
        report.metrics.anomalySeverity > 70 ? "CRITICAL: Highly artificial propagation vectors detected." : 
        report.metrics.anomalySeverity > 30 ? "SUSPICIOUS: Viral distribution exceeds organic discussion rates." : "NORMAL: Healthy propagation curves.";

    // Render keyword weights bar chart
    renderKeywordBarChart(report.wordContributions);

    // Update Propagation dot coordinates
    // SVG viewbox coordinates are 0 to 200. Axes margins are: x=20 to 190, y=180 to 10
    // Normalise Amplification Rate (X): ampRate 0 to 100% -> map to 20 to 190 px
    // Normalise BSI (Y): BSI 0 to 50 -> map to 180 to 10 px
    const dot = document.getElementById("bot-dot");
    const ampRateVal = parseFloat(report.metrics.ampRate);
    const bsiVal = parseFloat(report.metrics.bsi);

    const targetX = 20 + Math.min(1, ampRateVal / 100) * 170;
    const targetY = 180 - Math.min(1, bsiVal / 40) * 170;

    dot.setAttribute("cx", targetX.toString());
    dot.setAttribute("cy", targetY.toString());

    // Update coordinate scorecard texts
    document.getElementById("readout-bsi").innerText = report.metrics.bsi;
    document.getElementById("readout-amp").innerText = report.metrics.ampRate + "%";
    
    // Change coordinate dot glow color based on anomaly
    if (report.metrics.anomalySeverity > 75) {
        dot.setAttribute("fill", "var(--color-accent-red)");
    } else if (report.metrics.anomalySeverity > 35) {
        dot.setAttribute("fill", "var(--color-accent-yellow)");
    } else {
        dot.setAttribute("fill", "var(--color-accent-green)");
    }
}

// Render dynamic weights bar chart layout
function renderKeywordBarChart(contributions) {
    const container = document.getElementById("bar-chart-content");
    container.innerHTML = "";

    if (!contributions || contributions.length === 0) {
        container.innerHTML = '<div class="no-data-msg">No predictive keywords matching the local vocabulary models were extracted from this content.</div>';
        return;
    }

    // Limit display to top 6 high impact terms
    const topContributions = contributions.slice(0, 6);

    topContributions.forEach(item => {
        const row = document.createElement("div");
        row.className = "chart-row";

        const word = document.createElement("span");
        word.className = "chart-word";
        word.innerText = item.word;
        word.title = `Vocabulary: ${item.word}`;

        const barBg = document.createElement("div");
        barBg.className = "chart-bar-bg";

        const barFill = document.createElement("div");
        barFill.className = "chart-bar-fill";
        
        // Normalize width for bar (Cap representation at maximum 4.0 contribution logit)
        const widthPct = Math.min(100, (Math.abs(item.contribution) / 4.0) * 50); // half of width max is 50% shift
        barFill.style.width = widthPct + "%";

        const val = document.createElement("span");
        val.className = "chart-val";

        if (item.contribution >= 0) {
            barFill.classList.add("bar-fill-positive");
            val.classList.add("positive");
            val.innerText = "+" + item.contribution.toFixed(2);
        } else {
            barFill.classList.add("bar-fill-negative");
            val.classList.add("negative");
            val.innerText = item.contribution.toFixed(2);
        }

        barBg.appendChild(barFill);
        row.appendChild(word);
        row.appendChild(barBg);
        row.appendChild(val);
        container.appendChild(row);
    });
}


// 6. Mathematical Sandbox Simulator Update Functions
function runSandboxUpdate() {
    if (currentTab !== "tab-sandbox-section") return;

    // Get slider percentages (0 - 100)
    const vocabSlide = parseInt(document.getElementById("sb-vocab").value);
    const biasSlide = parseInt(document.getElementById("sb-bias").value);
    const styleSlide = parseInt(document.getElementById("sb-stylometry").value);
    const sourceSlide = parseInt(document.getElementById("sb-source").value);
    const anomalySlide = parseInt(document.getElementById("sb-anomaly").value);

    // Sync slider displays
    document.getElementById("val-sb-vocab").innerText = vocabSlide + "%";
    document.getElementById("val-sb-bias").innerText = biasSlide + "%";
    document.getElementById("val-sb-stylometry").innerText = styleSlide + "%";
    document.getElementById("val-sb-source").innerText = sourceSlide + "%";
    document.getElementById("val-sb-anomaly").innerText = anomalySlide + "%";

    // Mathematical Sandbox Logit Calculation (Simulating Logistic Activation boundaries)
    // Map percentages to actual mathematical logs/weight limits:
    const wVocab = (vocabSlide / 100) * 5.0;       // Max weight 5.0
    const wBias = (biasSlide / 100) * 3.0;         // Max weight 3.0
    const wStyle = (styleSlide / 100) * 2.5;       // Max weight 2.5
    const wSource = (sourceSlide / 100) * -4.0;     // Verified Source decreases fake score (max negative 4.0)
    const wAnomaly = (anomalySlide / 100) * 3.5;   // Max weight 3.5
    
    // Constant bias intercept
    const intercept = -0.8;

    const zLogit = intercept + wVocab + wBias + wStyle + wSource + wAnomaly;
    
    // Apply standard logistic Sigmoid activation
    const pFake = 1 / (1 + Math.exp(-zLogit));

    // Update equations displays
    document.getElementById("sandbox-logit").innerText = (zLogit >= 0 ? "+" : "") + zLogit.toFixed(3);
    document.getElementById("sandbox-prob").innerText = (pFake * 100).toFixed(1) + "%";

    // Render Sandbox SVG Sigmoid Curve coordinate dot
    // SVG Viewbox dimensions: x=0 to 300, y=0 to 200. Axes margins: x=30 to 270, y=190 to 10
    // z ranges from -5 to +5 (standard logistic scale). Normalise z:
    const zMin = -5.0;
    const zMax = 5.0;
    const zClamped = Math.max(zMin, Math.min(zMax, zLogit));
    const targetX = 30 + ((zClamped - zMin) / (zMax - zMin)) * 240;

    // Probability maps directly to Y axis: pFake = 0.0 -> Y = 190 px, pFake = 1.0 -> Y = 10 px
    const targetY = 190 - (pFake * 180);

    const sDot = document.getElementById("sigmoid-dot");
    if (sDot) {
        sDot.setAttribute("cx", targetX.toString());
        sDot.setAttribute("cy", targetY.toString());

        // Update dot color state based on classification boundary (z=0 / p=0.5)
        if (pFake > 0.6) {
            sDot.setAttribute("fill", "var(--color-accent-red)");
        } else if (pFake > 0.35) {
            sDot.setAttribute("fill", "var(--color-accent-yellow)");
        } else {
            sDot.setAttribute("fill", "var(--color-accent-green)");
        }
    }
}

// 7. Initialise Application on load
window.addEventListener("DOMContentLoaded", () => {
    // Generate default simulation sigmoid path for Sandbox visual
    const path = document.getElementById("sigmoid-curve-path");
    if (path) {
        let pathPoints = "";
        for (let xCoord = 30; xCoord <= 270; xCoord += 5) {
            // Normalize X coordinate to z score (-5 to +5)
            const zVal = -5.0 + ((xCoord - 30) / 240) * 10.0;
            const pFakeVal = 1 / (1 + Math.exp(-zVal));
            const yCoord = 190 - (pFakeVal * 180);
            
            if (xCoord === 30) {
                pathPoints += `M ${xCoord},${yCoord}`;
            } else {
                pathPoints += ` L ${xCoord},${yCoord}`;
            }
        }
        path.setAttribute("d", pathPoints);
    }

    // Load initial verified press example to populate dashboard naturally on launch
    loadExample("ap");
});
