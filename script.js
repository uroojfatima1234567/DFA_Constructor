document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generateTransitions');
    const createDFABtn = document.getElementById('createDFA');
    const checkStringBtn = document.getElementById('checkString');
    const canvas = document.getElementById('dfaCanvas');
    const ctx = canvas.getContext('2d');
    
    let dfa = {
        states: [],
        alphabets: [],
        finalStates: [],
        transitions: {},
        startState: ''
    };

    // Event Listeners
    generateBtn.addEventListener('click', generateTransitions);
    createDFABtn.addEventListener('click', createDFA);
    checkStringBtn.addEventListener('click', checkString);

    function generateTransitions() {
        // Clear previous data
        dfa = {
            states: [],
            alphabets: [],
            finalStates: [],
            transitions: {},
            startState: ''
        };

        // Get input values
        const statesInput = document.getElementById('states').value.trim();
        const alphabetsInput = document.getElementById('alphabets').value.trim();
        const initialStateInput = document.getElementById('initialState').value.trim();
        const finalStatesInput = document.getElementById('finalStates').value.trim();

        // Validate inputs
        if (!statesInput || !alphabetsInput || !initialStateInput) {
            alert('Please enter states, alphabets, and initial state');
            return;
        }

        // Process inputs
        dfa.states = statesInput.split(',').map(s => s.trim());
        dfa.alphabets = alphabetsInput.split(',').map(a => a.trim());
        dfa.startState = initialStateInput;
        dfa.finalStates = finalStatesInput ? finalStatesInput.split(',').map(s => s.trim()) : [];

        // Validate initial state
        if (!dfa.states.includes(dfa.startState)) {
            alert(`Initial state "${dfa.startState}" is not in the states list`);
            return;
        }

        // Generate transition table
        let tableHTML = '';
        dfa.states.forEach(state => {
            tableHTML += `<div class="transition-row">
                <h4>State ${state}</h4>`;
            
            dfa.alphabets.forEach(alphabet => {
                tableHTML += `
                <div class="transition-input">
                    <label>δ(${state}, ${alphabet}) =</label>
                    <select id="transition_${state}_${alphabet}">
                        <option value="">Select state</option>
                        ${dfa.states.map(s => `<option value="${s}">${s}</option>`).join('')}
                    </select>
                </div>`;
            });
            
            tableHTML += `</div>`;
        });

        document.getElementById('transitionTable').innerHTML = tableHTML;
        document.getElementById('transitionSection').classList.remove('hidden');
    }

    function createDFA() {
        // Validate if transitions are generated first
        if (dfa.states.length === 0) {
            alert('Please generate transitions first');
            return;
        }

        // Store transitions
        dfa.transitions = {};
        let allTransitionsSet = true;
        
        dfa.states.forEach(state => {
            dfa.transitions[state] = {};
            dfa.alphabets.forEach(alphabet => {
                const select = document.getElementById(`transition_${state}_${alphabet}`);
                const value = select ? select.value : '';
                dfa.transitions[state][alphabet] = value;
                
                if (!value) {
                    allTransitionsSet = false;
                }
            });
        });

        if (!allTransitionsSet) {
            alert('Please set all transitions before creating DFA');
            return;
        }

        // Draw DFA
        drawDFA();
        document.getElementById('dfaVisualization').classList.remove('hidden');
    }

    function drawDFA() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate state positions
        const statePositions = {};
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(150, centerY - 50);
        
        if (dfa.states.length === 1) {
            statePositions[dfa.states[0]] = { x: centerX, y: centerY };
        } 
        else if (dfa.states.length === 2) {
            statePositions[dfa.states[0]] = { x: centerX - 100, y: centerY };
            statePositions[dfa.states[1]] = { x: centerX + 100, y: centerY };
        }
        else {
            // Circular layout for 3+ states
            const angleStep = (2 * Math.PI) / dfa.states.length;
            dfa.states.forEach((state, index) => {
                const angle = index * angleStep;
                statePositions[state] = {
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle)
                };
            });
        }

        // Draw transitions
        for (const fromState in dfa.transitions) {
            for (const alphabet in dfa.transitions[fromState]) {
                const toState = dfa.transitions[fromState][alphabet];
                if (fromState === toState) {
                    drawSelfLoop(ctx, statePositions[fromState], alphabet);
                } else {
                    drawTransition(ctx, statePositions[fromState], statePositions[toState], alphabet);
                }
            }
        }

        // Draw states
        for (const state in statePositions) {
            const { x, y } = statePositions[state];
            
            // State circle
            ctx.beginPath();
            ctx.arc(x, y, 30, 0, 2 * Math.PI);
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Initial state arrow
            if (state === dfa.startState) {
                ctx.beginPath();
                ctx.moveTo(x - 60, y);
                ctx.lineTo(x - 30, y);
                ctx.strokeStyle = '#2c3e50';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Arrowhead
                ctx.beginPath();
                ctx.moveTo(x - 30, y);
                ctx.lineTo(x - 40, y - 10);
                ctx.moveTo(x - 30, y);
                ctx.lineTo(x - 40, y + 10);
                ctx.stroke();
            }

            // Final state marker
            if (dfa.finalStates.includes(state)) {
                ctx.beginPath();
                ctx.arc(x, y, 25, 0, 2 * Math.PI);
                ctx.stroke();
            }

            // State label
            ctx.font = '16px Arial';
            ctx.fillStyle = '#2c3e50';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(state, x, y);
        }
    }

    function drawTransition(ctx, from, to, label) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const arrowSize = 30;
        
        const startX = from.x + (dx/distance) * arrowSize;
        const startY = from.y + (dy/distance) * arrowSize;
        const endX = to.x - (dx/distance) * arrowSize;
        const endY = to.y - (dy/distance) * arrowSize;

        // Draw line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Arrowhead
        const angle = Math.atan2(dy, dx);
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - 10 * Math.cos(angle - Math.PI/6), endY - 10 * Math.sin(angle - Math.PI/6));
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - 10 * Math.cos(angle + Math.PI/6), endY - 10 * Math.sin(angle + Math.PI/6));
        ctx.stroke();

        // Label
        const midX = (startX + endX)/2;
        const midY = (startY + endY)/2;
        ctx.font = '12px Arial';
        ctx.fillStyle = '#e74c3c';
        ctx.textAlign = 'center';
        ctx.fillText(label, midX, midY - 10);
    }

    function drawSelfLoop(ctx, state, label) {
        // Circular self-loop
        ctx.beginPath();
        ctx.arc(state.x, state.y - 40, 25, 0.25 * Math.PI, 1.75 * Math.PI);
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Arrowhead
        const arrowAngle = 1.25 * Math.PI;
        const arrowX = state.x + 25 * Math.cos(arrowAngle);
        const arrowY = state.y - 40 + 25 * Math.sin(arrowAngle);
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 8 * Math.cos(arrowAngle - Math.PI/6), arrowY - 8 * Math.sin(arrowAngle - Math.PI/6));
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 8 * Math.cos(arrowAngle + Math.PI/6), arrowY - 8 * Math.sin(arrowAngle + Math.PI/6));
        ctx.stroke();
        
        // Label
        ctx.font = '12px Arial';
        ctx.fillStyle = '#e74c3c';
        ctx.textAlign = 'center';
        ctx.fillText(label, state.x, state.y - 70);
    }

    function checkString() {
        const inputString = document.getElementById('testString').value.trim();
        const resultDiv = document.getElementById('result');
        
        if (!inputString) {
            alert('Please enter a string to test');
            return;
        }

        let currentState = dfa.startState;
        let path = [currentState];
        
        for (const char of inputString) {
            if (!dfa.alphabets.includes(char)) {
                resultDiv.textContent = `Invalid character '${char}' in input`;
                resultDiv.className = 'rejected';
                return;
            }
            
            currentState = dfa.transitions[currentState][char];
            if (!currentState) {
                resultDiv.textContent = 'No transition defined for this input';
                resultDiv.className = 'rejected';
                return;
            }
            path.push(currentState);
        }

        if (dfa.finalStates.includes(currentState)) {
            resultDiv.textContent = `Accepted (Path: ${path.join(' → ')})`;
            resultDiv.className = 'accepted';
        } else {
            resultDiv.textContent = `Rejected (Path: ${path.join(' → ')})`;
            resultDiv.className = 'rejected';
        }
    }
});