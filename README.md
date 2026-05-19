# VERITAS // Advanced AI Fake News & Credibility Detection

**Designed and Coded by Au Amores**

VERITAS (Latin for *Truth*) is a state-of-the-art, client-side artificial intelligence tool and media auditing platform. It is designed to automatically detect misleading, sensational, or false information in online news stories by analyzing textual syntax, stylometric characteristics, source credibility registries, and social media propagation metrics.

Running completely inside the client-side browser context, VERITAS protects user privacy by eliminating external server data leaks during analysis.

---

## 🎯 Objectives & Core Features

### 1. Classification & Credibility Grading
*   Grades news articles on a **Trust Index (0% - 100%)** scale.
*   Classifies inputs into distinct operational brackets: `Verified / Credible`, `Credible / Minor Sensationalism`, `Suspicious / Clickbait`, `High-Risk Disinformation`, or `Satire / Parody`.

### 2. Textual Syntax & Style Profiling
*   **Stylometrics**: Analyzes capitalization patterns (screaming ALL-CAPS ratios), punctuation density, and multiple punctuation indicators (e.g., `!!!`).
*   **Subjectivity Mapping**: Scans for emotional valence, highly subjective adjectives, and biased phrasing.
*   **Clickbait Engine**: Checks headlines and content against substring directories of sensationalized hooks.

### 3. Lexical Complexity Analytics
*   **Flesch Reading Ease**: Measures structural sentence counts and syllable densities to evaluate writing effort.
*   **Lexical Diversity**: Computes the Type-Token Ratio (unique words divided by total words) to separate highly repetitive, low-effort posts from structured professional journalism.

### 4. Source Credibility Registry
*   Cross-references domains against local trust registries, sorting them into *Verified Press* (e.g. AP, Reuters, BBC), *Satirical Outlets* (e.g. The Onion), and *Identified Low-Credibility Domains*.

### 5. Social Engagement Propagation Auditing
*   Analyzes Views, Shares, Comments, and Likes to compute:
    *   **Blind Share Index (BSI)**: Measures the viral sharing multiplier relative to discussion depth. High BSI indicates sharing without reading.
    *   **Amplification Factor**: Audits engagement density vs. overall views to flag bot-like coordinated boosting.

---

## 🧬 Architectural Pipeline

```
[ User Input: Text, Domain, Social Metrics ]
                   │
                   ▼
       ┌──────────────────────┐
       │  Feature Extraction  │
       └──────────┬───────────┘
                  │
  ┌───────────────┼───────────────┬───────────────┐
  ▼               ▼               ▼               ▼
[Stylometry] [Lexical Complexity] [Source Trust] [Social Anomaly]
  │               │               │               │
  └───────────────┼───────────────┴───────────────┘
                  │
                  ▼
       ┌──────────────────────┐
       │ Linear Logit Intercept│  z = β₀ + Σ(wᵢ * xᵢ)
       └──────────┬───────────┘
                  │
                  ▼
       ┌──────────────────────┐
       │  Sigmoid Activation  │  P(Fake) = 1 / (1 + e⁻ᶻ)
       └──────────┬───────────┘
                  │
                  ▼
       ┌──────────────────────┐
       │ Final Trust Rating   │  Trust % = (1 - P(Fake)) * 100
       └──────────────────────┘
```

---

## 📐 Mathematical Formulation

### 1. Flesch Reading Ease Formula
$$\text{FRE} = 206.835 - 1.015 \times \left(\frac{\text{total words}}{\text{total sentences}}\right) - 84.6 \times \left(\frac{\text{total syllables}}{\text{total words}}\right)$$

### 2. Social Metric Ratios
*   **Blind Share Index (BSI)**:
    $$\text{BSI} = \frac{\text{Shares}}{\text{Comments} + 1}$$
*   **Amplification Rate (AR)**:
    $$\text{AR} = \frac{\text{Shares} + \text{Likes}}{\text{Views} + 1}$$

### 3. Logistic Regression Classifier
All individual feature weights ($x_i$) and logit adjustments are combined linearly to produce the cumulative log-odds score ($z$):
$$z = \beta_0 + z_{\text{vocab}} + z_{\text{style}} + z_{\text{source}} + z_{\text{anomaly}}$$
The final probability that the content represents fake news, $P(\text{Fake})$, is resolved via the standard logistic sigmoid activation:
$$P(\text{Fake}) = \frac{1}{1 + e^{-z}}$$

---

## 📂 Repository Directory

*   **`index.html`**: Semantic page structure featuring the control sidebars, text paste forms, coordinate progress gauges, dynamic scorecards, and the interactive Sigmoid activation graph.
*   **`styles.css`**: Vanilla CSS styling system implementing deep space dark themes, glassmorphism cards, neon HSL styling variables, and hover micro-animations.
*   **`app.js`**: Core JavaScript evaluation engine containing the tokenizers, syllable estimators, stopword filters, local weight dictionary, anomaly multipliers, and SVG drawing renderers.

---

## 🚀 How to Run Locally

Because VERITAS is implemented entirely in client-side HTML, CSS, and JS, running it is simple. No compilers or package installations are required.

### Option A: Spin Up Local HTTP Server (Recommended)
Navigate to the directory in your terminal and run a lightweight server:

**Using Node (npx)**:
```bash
npx http-server -p 8000
```

**Using Python**:
```bash
python -m http.server 8000
```

Once running, open your web browser to:
👉 **`http://localhost:8000`**

### Option B: Direct Launch
Simply double-click the **`index.html`** file in your local file systems to launch the dashboard directly inside your default web browser (using the `file://` protocol).

---

## 🛡️ License
VERITAS is created with absolute privacy preservation, containing zero external backend analytics or data exports. 

*Designed and Coded by Au Amores // Veritas engine v1.0.0*
