import { normalizeImportData } from './src/lib/import/normalize';
import { validateQuestion } from './src/lib/import/validate';

const data = [{
    "subject": "Mathematics",
    "chapter": "Binomial Theorem",
    "question_type": "mcq_numerical",
    "difficulty": "hard",
    "medium": "English",
    "question": "If $\\displaystyle \\sum_{r=0}^{5} \\dfrac{{}^{11}C_{2r+1}}{2r+2} = \\dfrac{m}{n}$ with $\\gcd(m, n) = 1$, then $m - n$ is equal to ______.",
    "option_a": "",
    "option_b": "",
    "option_c": "",
    "option_d": "",
    "correct_answer": "2035",
    "solution": "Integrating...",
    "note": "JEE Main 2025 January",
    "import": ""
}];

const normalized = normalizeImportData(data as any);
console.log('Normalized:', JSON.stringify(normalized, null, 2));

const validation = validateQuestion(normalized[0]);
console.log('Validation:', JSON.stringify(validation, null, 2));
