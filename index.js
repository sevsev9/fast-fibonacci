const bigint = require('big-integer');
const fs = require('fs/promises');

/**
 * Calculates the pisaon period for a given modulus
 * @param {bigint} m the modulus to be calculated from
 * @returns the pisano period
 */
function pisano(m) {
    let prev = 0;
    let curr = 1;
    let res = 0;

    for (let i = 0; i < m * m; i++) {
        let temp = 0;
        temp = curr;
        curr = (prev + curr) % m;
        prev = temp;

        if (prev == 0 && curr == 1)
            res = i + 1;
    }
    return res;
}

/**
 * Calculates the number at the given fibonacci index via the pisano series.
 * @param {bigint} n Fibonacci Index to be calculated
 * @param {*} m The modulus
 * @returns the number at the given fibonacci index
 */
function fibmodp(n, m) {
    n = parseInt(n.mod(pisano(m)).toString()); //take the nth fib# mod the pisano period
    console.log(n);
    let prev = 0
    let curr = 1

    if (n == 0)
        return 0;
    else if (n == 1)
        return 1;

    for (let i = 0; i < n - 1; i++) {
        let temp = 0;
        temp = curr;
        curr = (prev + curr) % m;
        prev = temp;
    }

    return curr % m;
};

 /**
     * @param {bigint} prev 
     * @param {bigint} curr 
     * @returns The number at Fibonacci index f(2n).
     */
  function f2n(prev, curr) {
    let next = prev.add(curr);
    return next.multiply(2).subtract(curr).multiply(curr);
}

/**
 * @param {bigint} prev 
 * @param {bigint} curr 
 * @returns The number at Fibonacci index f(2n + 1).
 */
function f2n1(prev, curr) {
    let next = prev.add(curr);
    return next.square().add(curr.square());
}

/**
 * @param {bigint} prev 
 * @param {bigint} curr 
 * @returns The number at Fibonacci index f(2n - 1).
 */
function f2n_1(prev, curr) {
    return prev.square().add(curr.square());
}

/**
 * Calculates the Fibonacci number at a given index.
 * @param {bigint} n the fibonacci index
 * @param {bigint} m the modulus
 * @param {boolean} calcmod if the number should be calculated with modulus
 * @param {string} out output file
 * @returns {string} the calculated value
 */
function fibmod(n, m, calcmod = true, out) {
    let fout = "# Determined Calculation Path: \n";

    // Determine calculation path
    let path = [];
    let x = n.add(0); // clone input index
    while (!x.eq(1)) {  // work path backwards
        if (x.isEven()) {
            x = x.divide(2);
            path.push({ value: x, odd: false })
        } else {
            x = x.subtract(1).divide(2);
            path.push({ value: x, odd: true });
        }
    }

    path.reverse(); // reverse path to follow the calculation from fib-index 1

    for (let i = 0; i < path.length; i++) { //output path
        if (typeof out === 'string') {
            fout += `step: ${(i + '').padStart(3, ' ')} | odd: ${(path[i].odd + '').padStart(5, ' ')} | fibonacci index: ${path[i].value.toString()}\n`;
        } else {
            console.log(`step: ${(i + '').padStart(3, ' ')} | odd: ${(path[i].odd + '').padStart(5, ' ')} | fibonacci index: ${path[i].value.toString()}`);
        }
    }

    let path2 = []; // calculation path for fib-index

    let prev = new bigint(0);
    let curr = new bigint(1);
    for (let i = 0; i < path.length; i++) { // this method will calculate the given index in a matter of roof(log2(n)) steps
        let tmp0 = prev;
        let tmp1 = curr;
        if (path[i].odd) {
            // calculate f2n and f2n+1
            prev = f2n(tmp0, tmp1);
            curr = f2n1(tmp0, tmp1);
        } else {
            // calculate f2n-1 and f2n
            prev = f2n_1(tmp0, tmp1);
            curr = f2n(tmp0, tmp1);
        }

        if(calcmod) {   // take modulus of numbers if flag is set
             prev = prev.mod(m);
             curr = curr.mod(m);   
        }

        // Log calculation path
        path2.push({value: curr.value.toString().padStart(6, ' '), idx: path[i].value.multiply(2).toString()});

        //Debug calculation path
        //console.log(`idx: ${(i + '').padStart(3, ' ')} | number length: ${curr.value.toString().length}`);
    }

    if(typeof out === 'string') {
        fout+= "\n# Actual Calculation Path:\n"
        for (let i = 0; i < path2.length; i++) {
            fout += `value: ${path2[i].value} | idx: ${path2[i].idx}\n`
        }

        fs.writeFile(out, fout);
    } else {
        console.log(path2);
    }

    return curr.value.toString();
}

// Calculate F(10^28) mod 45007 with file output to './output.txt'
console.log('Result F(10^28) mod 45007: ' + fibmod(new bigint("1e28"), 45007, true, './output.txt'));