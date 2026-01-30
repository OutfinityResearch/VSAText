# Evals Suite — SCRIPTA

## Overview
This folder contains evaluation examples with:
- Natural Language (NL) prompts
- Controlled Natural Language (CNL) translations

## Files
- scripta_nl_cnl.jsonl: JSON Lines with NL and CNL pairs

Current size: 100 examples across book, screenplay, tutorial, research, reverse engineering, review, compliance, XAI, orchestration, and retrieval.

## Format
Each line is a JSON object:
- id: unique identifier
- domain: book, screenplay, research, tutorial
- nl: natural language requirement
- cnl: CNL translation (one statement per line)
- tags: list of short tags
