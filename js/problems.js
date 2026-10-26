/**
 * ProjectDefense - Proprietary & Confidential
 * Copyright (c) 2026 Nikith Padmanabhuni. All Rights Reserved.
 * Unauthorized copying, distribution, reverse-engineering, or commercial use is strictly prohibited.
 */

/**
 * problems.js
 * Bank of 30 No-AI algorithmic and SQL-style coding problems.
 * Categories:
 * - 12 Arrays and Strings
 * - 6 Recursion and Backtracking
 * - 4 Stacks, Queues, and Linked Lists
 * - 4 Math and Bit Manipulation
 * - 4 SQL-Style Logic in JavaScript
 */

export const PROBLEMS = [
  // ==========================================
  // ARRAYS AND STRINGS (12)
  // ==========================================
  {
    id: "arr-01",
    title: "Two Sum",
    topic: "Arrays and Strings",
    difficulty: "Easy",
    concepts: ["hashmap", "two-pointers"],
    statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume each input has exactly one solution, and you may not use the same element twice.",
    starterCode: `function twoSum(nums, target) {
  // Return [index1, index2]
  
}`,
    visibleTests: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] }
    ],
    hiddenTests: [
      { input: [[3, 3], 6], expected: [0, 1] },
      { input: [[1, 5, 8, 12, 19], 20], expected: [0, 4] },
      { input: [[-3, 4, 3, 90], 0], expected: [0, 2] }
    ]
  },
  {
    id: "arr-02",
    title: "Reverse String Array",
    topic: "Arrays and Strings",
    difficulty: "Easy",
    concepts: ["two-pointers", "in-place"],
    statement: "Write a function that reverses an array of characters in-place and returns the array.",
    starterCode: `function reverseString(arr) {
  // Reverse in-place and return arr
  
}`,
    visibleTests: [
      { input: [["h", "e", "l", "l", "o"]], expected: ["o", "l", "l", "e", "h"] },
      { input: [["H", "a", "n", "n", "a", "h"]], expected: ["h", "a", "n", "n", "a", "H"] }
    ],
    hiddenTests: [
      { input: [["a"]], expected: ["a"] },
      { input: [["1", "2", "3", "4"]], expected: ["4", "3", "2", "1"] },
      { input: [[]], expected: [] }
    ]
  },
  {
    id: "arr-03",
    title: "Maximum Subarray (Kadane)",
    topic: "Arrays and Strings",
    difficulty: "Medium",
    concepts: ["prefix-sum", "kadane"],
    statement: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    starterCode: `function maxSubArray(nums) {
  // Return largest contiguous subarray sum
  
}`,
    visibleTests: [
      { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { input: [[1]], expected: 1 }
    ],
    hiddenTests: [
      { input: [[5, 4, -1, 7, 8]], expected: 23 },
      { input: [[-1, -2, -3]], expected: -1 },
      { input: [[2, -1, 3, 4, -2]], expected: 8 }
    ]
  },
  {
    id: "arr-04",
    title: "Valid Palindrome",
    topic: "Arrays and Strings",
    difficulty: "Easy",
    concepts: ["two-pointers", "strings"],
    statement: "Given a string s, return true if it is a palindrome, considering only alphanumeric characters and ignoring cases. Otherwise, return false.",
    starterCode: `function isPalindrome(s) {
  // Return boolean true or false
  
}`,
    visibleTests: [
      { input: ["A man, a plan, a canal: Panama"], expected: true },
      { input: ["race a car"], expected: false }
    ],
    hiddenTests: [
      { input: [" "], expected: true },
      { input: ["0P"], expected: false },
      { input: ["Madam"], expected: true }
    ]
  },
  {
    id: "arr-05",
    title: "Move Zeroes",
    topic: "Arrays and Strings",
    difficulty: "Easy",
    concepts: ["two-pointers", "in-place"],
    statement: "Given an integer array nums, move all 0's to the end of it while maintaining the relative order of the non-zero elements. Return the modified array.",
    starterCode: `function moveZeroes(nums) {
  // Move 0s to end and return nums
  
}`,
    visibleTests: [
      { input: [[0, 1, 0, 3, 12]], expected: [1, 3, 12, 0, 0] },
      { input: [[0]], expected: [0] }
    ],
    hiddenTests: [
      { input: [[1, 2, 3]], expected: [1, 2, 3] },
      { input: [[0, 0, 1]], expected: [1, 0, 0] },
      { input: [[4, 0, 5, 0, 6]], expected: [4, 5, 6, 0, 0] }
    ]
  },
  {
    id: "arr-06",
    title: "Longest Substring Without Repeating Characters",
    topic: "Arrays and Strings",
    difficulty: "Medium",
    concepts: ["sliding-window", "hashmap"],
    statement: "Given a string s, find the length of the longest substring without repeating characters in O(N) time.",
    starterCode: `function lengthOfLongestSubstring(s) {
  // Return length integer
  
}`,
    visibleTests: [
      { input: ["abcabcbb"], expected: 3 },
      { input: ["bbbbb"], expected: 1 }
    ],
    hiddenTests: [
      { input: ["pwwkew"], expected: 3 },
      { input: [""], expected: 0 },
      { input: ["au"], expected: 2 }
    ]
  },
  {
    id: "arr-07",
    title: "Subarray Sum Equals K",
    topic: "Arrays and Strings",
    difficulty: "Medium",
    concepts: ["prefix-sum", "hashmap"],
    statement: "Given an array of integers nums and an integer k, return the total number of continuous subarrays whose sum equals k.",
    starterCode: `function subarraySum(nums, k) {
  // Return count of subarrays
  
}`,
    visibleTests: [
      { input: [[1, 1, 1], 2], expected: 2 },
      { input: [[1, 2, 3], 3], expected: 2 }
    ],
    hiddenTests: [
      { input: [[1, -1, 0], 0], expected: 3 },
      { input: [[3, 4, 7, 2, -3, 1, 4, 2], 7], expected: 4 },
      { input: [[1], 0], expected: 0 }
    ]
  },
  {
    id: "arr-08",
    title: "Container With Most Water",
    topic: "Arrays and Strings",
    difficulty: "Medium",
    concepts: ["two-pointers", "greedy"],
    statement: "Given n non-negative integers height where each represents a point at coordinate (i, height[i]), find two lines that together with the x-axis form a container that holds the most water. Return the maximum amount of water.",
    starterCode: `function maxArea(height) {
  // Return maximum area integer
  
}`,
    visibleTests: [
      { input: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49 },
      { input: [[1, 1]], expected: 1 }
    ],
    hiddenTests: [
      { input: [[4, 3, 2, 1, 4]], expected: 16 },
      { input: [[1, 2, 1]], expected: 2 },
      { input: [[2, 3, 10, 5, 7, 8, 9]], expected: 36 }
    ]
  },
  {
    id: "arr-09",
    title: "Merge Two Sorted Arrays",
    topic: "Arrays and Strings",
    difficulty: "Easy",
    concepts: ["two-pointers", "merge"],
    statement: "Given two sorted integer arrays nums1 and nums2, return a new sorted array containing all elements from both.",
    starterCode: `function mergeSorted(nums1, nums2) {
  // Return merged sorted array
  
}`,
    visibleTests: [
      { input: [[1, 3, 5], [2, 4, 6]], expected: [1, 2, 3, 4, 5, 6] },
      { input: [[], [1]], expected: [1] }
    ],
    hiddenTests: [
      { input: [[1, 2, 3], []], expected: [1, 2, 3] },
      { input: [[2, 2, 4], [1, 2, 5]], expected: [1, 2, 2, 2, 4, 5] },
      { input: [[5, 10], [1, 2, 3]], expected: [1, 2, 3, 5, 10] }
    ]
  },
  {
    id: "arr-10",
    title: "First Unique Character",
    topic: "Arrays and Strings",
    difficulty: "Easy",
    concepts: ["hashmap", "frequency-count"],
    statement: "Given a string s, find the first non-repeating character in it and return its index. If it does not exist, return -1.",
    starterCode: `function firstUniqChar(s) {
  // Return index integer
  
}`,
    visibleTests: [
      { input: ["leetcode"], expected: 0 },
      { input: ["loveleetcode"], expected: 2 }
    ],
    hiddenTests: [
      { input: ["aabb"], expected: -1 },
      { input: ["z"], expected: 0 },
      { input: ["dddccdbba"], expected: 8 }
    ]
  },
  {
    id: "arr-11",
    title: "Find All Anagrams in a String",
    topic: "Arrays and Strings",
    difficulty: "Medium",
    concepts: ["sliding-window", "frequency-count"],
    statement: "Given two strings s and p, return an array of all the start indices of p's anagrams in s. The answer can be in any order.",
    starterCode: `function findAnagrams(s, p) {
  // Return array of start indices
  
}`,
    visibleTests: [
      { input: ["cbaebabacd", "abc"], expected: [0, 6] },
      { input: ["abab", "ab"], expected: [0, 1, 2] }
    ],
    hiddenTests: [
      { input: ["baa", "aa"], expected: [1] },
      { input: ["hello", "world"], expected: [] },
      { input: ["a", "a"], expected: [0] }
    ]
  },
  {
    id: "arr-12",
    title: "Product of Array Except Self",
    topic: "Arrays and Strings",
    difficulty: "Medium",
    concepts: ["prefix-sum", "suffix-product"],
    statement: "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i], without using division.",
    starterCode: `function productExceptSelf(nums) {
  // Return output array
  
}`,
    visibleTests: [
      { input: [[1, 2, 3, 4]], expected: [24, 12, 8, 6] },
      { input: [[-1, 1, 0, -3, 3]], expected: [0, 0, 9, 0, 0] }
    ],
    hiddenTests: [
      { input: [[2, 3]], expected: [3, 2] },
      { input: [[1, 1, 1]], expected: [1, 1, 1] },
      { input: [[0, 0]], expected: [0, 0] }
    ]
  },

  // ==========================================
  // RECURSION AND BACKTRACKING (6)
  // ==========================================
  {
    id: "rec-01",
    title: "Factorial",
    topic: "Recursion and Backtracking",
    difficulty: "Easy",
    concepts: ["recursion", "base-case"],
    statement: "Compute the factorial of a non-negative integer n recursively. Note that 0! = 1.",
    starterCode: `function factorial(n) {
  // Compute n! recursively
  
}`,
    visibleTests: [
      { input: [5], expected: 120 },
      { input: [0], expected: 1 }
    ],
    hiddenTests: [
      { input: [1], expected: 1 },
      { input: [6], expected: 720 },
      { input: [10], expected: 3628800 }
    ]
  },
  {
    id: "rec-02",
    title: "Fibonacci Number",
    topic: "Recursion and Backtracking",
    difficulty: "Easy",
    concepts: ["recursion", "memoization"],
    statement: "Return the n-th Fibonacci number where F(0) = 0 and F(1) = 1.",
    starterCode: `function fib(n) {
  // Return n-th Fibonacci number
  
}`,
    visibleTests: [
      { input: [4], expected: 3 },
      { input: [2], expected: 1 }
    ],
    hiddenTests: [
      { input: [0], expected: 0 },
      { input: [7], expected: 13 },
      { input: [10], expected: 55 }
    ]
  },
  {
    id: "rec-03",
    title: "Power of a Number (x^n)",
    topic: "Recursion and Backtracking",
    difficulty: "Medium",
    concepts: ["recursion", "divide-and-conquer"],
    statement: "Implement recursive power calculation x^n for non-negative integer exponent n.",
    starterCode: `function myPow(x, n) {
  // Return x^n
  
}`,
    visibleTests: [
      { input: [2, 10], expected: 1024 },
      { input: [3, 3], expected: 27 }
    ],
    hiddenTests: [
      { input: [5, 0], expected: 1 },
      { input: [7, 1], expected: 7 },
      { input: [2, 5], expected: 32 }
    ]
  },
  {
    id: "rec-04",
    title: "Generate Subsets (Power Set)",
    topic: "Recursion and Backtracking",
    difficulty: "Medium",
    concepts: ["backtracking", "subsets"],
    statement: "Given an array of unique integers nums, return all possible subsets (the power set). Sort each subset and sort the subsets lexicographically.",
    starterCode: `function subsets(nums) {
  // Return sorted array of sorted subsets
  
}`,
    visibleTests: [
      { input: [[1, 2]], expected: [[], [1], [1, 2], [2]] },
      { input: [[0]], expected: [[], [0]] }
    ],
    hiddenTests: [
      { input: [[]], expected: [[]] },
      { input: [[1, 2, 3]], expected: [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]] },
      { input: [[9]], expected: [[], [9]] }
    ]
  },
  {
    id: "rec-05",
    title: "Permutations of Array",
    topic: "Recursion and Backtracking",
    difficulty: "Medium",
    concepts: ["backtracking", "permutations"],
    statement: "Given an array nums of distinct integers, return all possible permutations sorted lexicographically.",
    starterCode: `function permute(nums) {
  // Return sorted array of permutations
  
}`,
    visibleTests: [
      { input: [[1, 2]], expected: [[1, 2], [2, 1]] },
      { input: [[1]], expected: [[1]] }
    ],
    hiddenTests: [
      { input: [[1, 2, 3]], expected: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]] },
      { input: [[0, 1]], expected: [[0, 1], [1, 0]] },
      { input: [[]], expected: [[]] }
    ]
  },
  {
    id: "rec-06",
    title: "Combination Sum Count",
    topic: "Recursion and Backtracking",
    difficulty: "Medium",
    concepts: ["backtracking", "dynamic-programming"],
    statement: "Given an array of distinct positive integers candidates and a target integer, return the count of unique combinations summing up to target (elements can be chosen repeatedly).",
    starterCode: `function combinationSumCount(candidates, target) {
  // Return integer count
  
}`,
    visibleTests: [
      { input: [[2, 3, 6, 7], 7], expected: 2 },
      { input: [[2, 3, 5], 8], expected: 3 }
    ],
    hiddenTests: [
      { input: [[2], 1], expected: 0 },
      { input: [[1], 3], expected: 1 },
      { input: [[2, 4], 6], expected: 2 }
    ]
  },

  // ==========================================
  // STACKS, QUEUES, AND LINKED LISTS (4)
  // ==========================================
  {
    id: "stk-01",
    title: "Valid Parentheses",
    topic: "Stacks and Queues",
    difficulty: "Easy",
    concepts: ["stack", "strings"],
    statement: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    starterCode: `function isValidParentheses(s) {
  // Return boolean true or false
  
}`,
    visibleTests: [
      { input: ["()[]{}"], expected: true },
      { input: ["(]"], expected: false }
    ],
    hiddenTests: [
      { input: ["{[]}"], expected: true },
      { input: ["("], expected: false },
      { input: ["]"], expected: false }
    ]
  },
  {
    id: "stk-02",
    title: "Evaluate Reverse Polish Notation",
    topic: "Stacks and Queues",
    difficulty: "Medium",
    concepts: ["stack", "arithmetic"],
    statement: "Evaluate the value of an arithmetic expression in Reverse Polish Notation. Valid operators are +, -, *, and / (division truncates toward zero).",
    starterCode: `function evalRPN(tokens) {
  // Return evaluation integer
  
}`,
    visibleTests: [
      { input: [["2", "1", "+", "3", "*"]], expected: 9 },
      { input: [["4", "13", "5", "/", "+"]], expected: 6 }
    ],
    hiddenTests: [
      { input: [["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]], expected: 22 },
      { input: [["3"]], expected: 3 },
      { input: [["4", "2", "-"]], expected: 2 }
    ]
  },
  {
    id: "stk-03",
    title: "Simulate Queue using Two Stacks",
    topic: "Stacks and Queues",
    difficulty: "Medium",
    concepts: ["queue", "stack"],
    statement: "Given a list of operations on a FIFO queue: ['push', val], ['pop'], ['peek'], ['empty']. Return an array of results for all pop, peek, and empty calls in order.",
    starterCode: `function simulateQueue(operations) {
  // Return array of outputs
  
}`,
    visibleTests: [
      { input: [[["push", 1], ["push", 2], ["peek"], ["pop"], ["empty"]]], expected: [1, 1, false] },
      { input: [[["push", 5], ["pop"], ["empty"]]], expected: [5, true] }
    ],
    hiddenTests: [
      { input: [[["empty"]]], expected: [true] },
      { input: [[["push", 10], ["push", 20], ["pop"], ["peek"]]], expected: [10, 20] },
      { input: [[["push", 1], ["push", 2], ["push", 3], ["pop"], ["pop"]]], expected: [1, 2] }
    ]
  },
  {
    id: "stk-04",
    title: "Reverse a Linked List",
    topic: "Stacks and Queues",
    difficulty: "Easy",
    concepts: ["linked-list", "two-pointers"],
    statement: "Given an array representing a singly-linked list from head to tail, return the array representing the reversed list.",
    starterCode: `function reverseList(headArray) {
  // Return reversed array
  
}`,
    visibleTests: [
      { input: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
      { input: [[1, 2]], expected: [2, 1] }
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[9]], expected: [9] },
      { input: [[10, 20, 30]], expected: [30, 20, 10] }
    ]
  },

  // ==========================================
  // MATH AND BIT MANIPULATION (4)
  // ==========================================
  {
    id: "mat-01",
    title: "Single Number",
    topic: "Math and Bit Manipulation",
    difficulty: "Easy",
    concepts: ["bit-manipulation", "xor"],
    statement: "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one in linear time and O(1) space.",
    starterCode: `function singleNumber(nums) {
  // Return single number
  
}`,
    visibleTests: [
      { input: [[2, 2, 1]], expected: 1 },
      { input: [[4, 1, 2, 1, 2]], expected: 4 }
    ],
    hiddenTests: [
      { input: [[1]], expected: 1 },
      { input: [[7, 3, 5, 3, 7]], expected: 5 },
      { input: [[-1, -1, -5]], expected: -5 }
    ]
  },
  {
    id: "mat-02",
    title: "Number of 1 Bits (Hamming Weight)",
    topic: "Math and Bit Manipulation",
    difficulty: "Easy",
    concepts: ["bit-manipulation", "binary"],
    statement: "Write a function that takes the binary representation of an integer n >= 0 and returns the number of set ('1') bits it has.",
    starterCode: `function hammingWeight(n) {
  // Return count of 1 bits
  
}`,
    visibleTests: [
      { input: [11], expected: 3 },
      { input: [128], expected: 1 }
    ],
    hiddenTests: [
      { input: [0], expected: 0 },
      { input: [15], expected: 4 },
      { input: [255], expected: 8 }
    ]
  },
  {
    id: "mat-03",
    title: "Missing Number",
    topic: "Math and Bit Manipulation",
    difficulty: "Easy",
    concepts: ["math", "xor"],
    statement: "Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.",
    starterCode: `function missingNumber(nums) {
  // Return missing integer
  
}`,
    visibleTests: [
      { input: [[3, 0, 1]], expected: 2 },
      { input: [[0, 1]], expected: 2 }
    ],
    hiddenTests: [
      { input: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], expected: 8 },
      { input: [[0]], expected: 1 },
      { input: [[1]], expected: 0 }
    ]
  },
  {
    id: "mat-04",
    title: "FizzBuzz Generator",
    topic: "Math and Bit Manipulation",
    difficulty: "Easy",
    concepts: ["math", "modulo"],
    statement: "Given an integer n, return a string array answer (1-indexed) where answer[i] is 'FizzBuzz' if divisible by 3 and 5, 'Fizz' if divisible by 3, 'Buzz' if divisible by 5, or the index as a string.",
    starterCode: `function fizzBuzz(n) {
  // Return array of strings from 1 to n
  
}`,
    visibleTests: [
      { input: [3], expected: ["1", "2", "Fizz"] },
      { input: [5], expected: ["1", "2", "Fizz", "4", "Buzz"] }
    ],
    hiddenTests: [
      { input: [1], expected: ["1"] },
      { input: [15], expected: ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"] },
      { input: [6], expected: ["1", "2", "Fizz", "4", "Buzz", "Fizz"] }
    ]
  },

  // ==========================================
  // SQL-STYLE LOGIC IN JAVASCRIPT (4)
  // ==========================================
  {
    id: "sql-01",
    title: "SQL WHERE Filter: Active Users",
    topic: "SQL in JS",
    difficulty: "Easy",
    concepts: ["filtering", "sorting"],
    statement: "Given an array of user objects ({ id, name, age, isActive }) and a minAge number, return an array of user names where isActive === true and age >= minAge, sorted alphabetically.",
    starterCode: `function filterActiveUsers(users, minAge) {
  // Return sorted array of names
  
}`,
    visibleTests: [
      {
        input: [
          [
            { id: 1, name: "Alice", age: 25, isActive: true },
            { id: 2, name: "Bob", age: 19, isActive: false },
            { id: 3, name: "Charlie", age: 30, isActive: true }
          ],
          21
        ],
        expected: ["Alice", "Charlie"]
      },
      {
        input: [
          [{ id: 1, name: "Zara", age: 20, isActive: true }],
          22
        ],
        expected: []
      }
    ],
    hiddenTests: [
      {
        input: [
          [
            { id: 1, name: "Bob", age: 30, isActive: true },
            { id: 2, name: "Alice", age: 30, isActive: true }
          ],
          25
        ],
        expected: ["Alice", "Bob"]
      },
      {
        input: [[], 18],
        expected: []
      },
      {
        input: [
          [{ id: 1, name: "Dan", age: 40, isActive: false }],
          10
        ],
        expected: []
      }
    ]
  },
  {
    id: "sql-02",
    title: "SQL GROUP BY: Department Count",
    topic: "SQL in JS",
    difficulty: "Easy",
    concepts: ["group-by", "aggregation"],
    statement: "Given an array of employee objects ({ id, name, department }), return an object mapping each department name to the total number of employees in it.",
    starterCode: `function groupByDepartment(employees) {
  // Return { [department]: count }
  
}`,
    visibleTests: [
      {
        input: [
          [
            { id: 1, name: "A", department: "Eng" },
            { id: 2, name: "B", department: "Eng" },
            { id: 3, name: "C", department: "HR" }
          ]
        ],
        expected: { "Eng": 2, "HR": 1 }
      },
      {
        input: [[{ id: 1, name: "A", department: "Sales" }]],
        expected: { "Sales": 1 }
      }
    ],
    hiddenTests: [
      {
        input: [[]],
        expected: {}
      },
      {
        input: [
          [
            { id: 1, name: "A", department: "Ops" },
            { id: 2, name: "B", department: "Ops" },
            { id: 3, name: "C", department: "Ops" }
          ]
        ],
        expected: { "Ops": 3 }
      },
      {
        input: [
          [
            { id: 1, name: "A", department: "D1" },
            { id: 2, name: "B", department: "D2" }
          ]
        ],
        expected: { "D1": 1, "D2": 1 }
      }
    ]
  },
  {
    id: "sql-03",
    title: "SQL INNER JOIN: Users and Orders",
    topic: "SQL in JS",
    difficulty: "Medium",
    concepts: ["joins", "hashmap"],
    statement: "Given users array ({ id, name }) and orders array ({ id, userId, amount }), perform an INNER JOIN matching orders.userId with users.id. Return an array of objects ({ orderId, userName, amount }) sorted by orderId ascending.",
    starterCode: `function joinUsersAndOrders(users, orders) {
  // Return joined array of { orderId, userName, amount }
  
}`,
    visibleTests: [
      {
        input: [
          [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }],
          [{ id: 101, userId: 1, amount: 50 }, { id: 102, userId: 2, amount: 100 }]
        ],
        expected: [
          { orderId: 101, userName: "Alice", amount: 50 },
          { orderId: 102, userName: "Bob", amount: 100 }
        ]
      },
      {
        input: [
          [{ id: 1, name: "Alice" }],
          [{ id: 201, userId: 99, amount: 10 }]
        ],
        expected: []
      }
    ],
    hiddenTests: [
      {
        input: [
          [{ id: 1, name: "Alice" }],
          [{ id: 101, userId: 1, amount: 20 }, { id: 102, userId: 1, amount: 30 }]
        ],
        expected: [
          { orderId: 101, userName: "Alice", amount: 20 },
          { orderId: 102, userName: "Alice", amount: 30 }
        ]
      },
      {
        input: [[], []],
        expected: []
      },
      {
        input: [
          [{ id: 3, name: "Charlie" }],
          [{ id: 50, userId: 3, amount: 75 }]
        ],
        expected: [
          { orderId: 50, userName: "Charlie", amount: 75 }
        ]
      }
    ]
  },
  {
    id: "sql-04",
    title: "SQL ORDER BY & LIMIT: Top N Earners",
    topic: "SQL in JS",
    difficulty: "Medium",
    concepts: ["sorting", "limit"],
    statement: "Given an array of employee objects ({ id, name, salary }) and a number n, return an array of the names of the top n earners sorted by salary descending. If salaries are tied, break ties by sorting names alphabetically.",
    starterCode: `function topEarners(employees, n) {
  // Return array of top n names
  
}`,
    visibleTests: [
      {
        input: [
          [
            { id: 1, name: "Alice", salary: 90000 },
            { id: 2, name: "Bob", salary: 120000 },
            { id: 3, name: "Charlie", salary: 75000 }
          ],
          2
        ],
        expected: ["Bob", "Alice"]
      },
      {
        input: [
          [{ id: 1, name: "Alice", salary: 50000 }],
          3
        ],
        expected: ["Alice"]
      }
    ],
    hiddenTests: [
      {
        input: [
          [
            { id: 1, name: "Bob", salary: 100000 },
            { id: 2, name: "Alice", salary: 100000 }
          ],
          1
        ],
        expected: ["Alice"]
      },
      {
        input: [[], 5],
        expected: []
      },
      {
        input: [
          [
            { id: 1, name: "A", salary: 10 },
            { id: 2, name: "B", salary: 30 },
            { id: 3, name: "C", salary: 20 }
          ],
          2
        ],
        expected: ["B", "C"]
      }
    ]
  }
];
