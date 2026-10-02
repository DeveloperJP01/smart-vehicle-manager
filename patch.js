const fs = require('fs');

const file = 'frontend/src/Pages.js';
let c = fs.readFileSync(file, 'utf8');

// 1. Fix the Revenue KPI Icon
c = c.replace('<div className="kpi-icon healthy">$</div>', '<div className="kpi-icon healthy">₹</div>');

// 2. Fix the Parts Dropdown list
c = c.replace('- ${p.price.toFixed(2)}', '- ₹{p.price.toFixed(2)}');

// 3. Fix the "Add Part" Input Box Placeholder
c = c.replace('placeholder="Price ($)"', 'placeholder="Price (₹)"');

// 4. Fix the Parts Table Data
c = c.replace('>${p.price.toFixed(2)}</td>', '>₹{p.price.toFixed(2)}</td>');

fs.writeFileSync(file, c, 'utf8');
console.log('Currency successfully updated to Rupees!');