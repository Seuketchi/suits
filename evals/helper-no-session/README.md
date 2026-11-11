# helper-no-session

Run by hand, with the variable set in the shell that starts the eval:

    SUITS_HELPER=1 claude plugin eval . --case helper-no-session

A case's own `env` accepts only names that start with `EVAL_`, and the mod reads only `SUITS_HELPER`, so the variable cannot be set from the case. Without it the case does not test helper mode.
