#!/bin/bash

# Script to run all checks on the nest-city-account project
# This includes linting, type checking, testing, and building

set -e  # Exit on any error

# Parse command line arguments
ENABLE_LOGGING=true
VERBOSE=false
LOG_FILE="checks.log"

while [ $# -gt 0 ]; do
    case $1 in
        --no-log)
            ENABLE_LOGGING=false
            shift
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --log-file)
            LOG_FILE="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --no-log         Disable logging to file (show all output in console)"
            echo "  --verbose, -v    Show all output in console AND log to file"
            echo "  --log-file FILE  Specify custom log file (default: checks.log)"
            echo "  --help, -h       Show this help message"
            echo ""
            echo "By default, command outputs are logged to 'checks.log' and only"
            echo "script messages are shown in the console."
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo "🚀 Running all checks for nest-city-account..."
echo "================================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Initialize log file if logging is enabled
init_logging() {
    if [ "$ENABLE_LOGGING" = true ]; then
        # Create/clear log file
        > "$LOG_FILE"
        echo "=== Nest City Account Checks Log ===" >> "$LOG_FILE"
        echo "Started at: $(date)" >> "$LOG_FILE"
        echo "========================================" >> "$LOG_FILE"
        echo "" >> "$LOG_FILE"

        print_info "Logging enabled. Command outputs will be saved to: $LOG_FILE"
        if [ "$VERBOSE" = true ]; then
            print_info "Verbose mode: outputs will be shown in console AND logged to file"
        else
            print_info "Quiet mode: only script messages in console, full output in log file"
        fi
    else
        print_info "Logging disabled. All output will be shown in console."
    fi
}

# Function to log a message with timestamp
log_message() {
    if [ "$ENABLE_LOGGING" = true ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    fi
}

# Function to run a command and handle errors with logging
run_check() {
    local check_name="$1"
    local command="$2"

    print_status "Running $check_name..."
    log_message "=== Starting: $check_name ==="
    log_message "Command: $command"
    log_message ""

    if [ "$ENABLE_LOGGING" = true ] && [ "$VERBOSE" = false ]; then
        # Quiet mode: redirect output to log file only
        if eval "$command" >> "$LOG_FILE" 2>&1; then
            log_message "✅ $check_name completed successfully"
            log_message ""
            print_success "$check_name passed"
            return 0
        else
            local exit_code=$?
            log_message "❌ $check_name failed with exit code: $exit_code"
            log_message ""
            print_error "$check_name failed (check $LOG_FILE for details)"
            return 1
        fi
    elif [ "$ENABLE_LOGGING" = true ] && [ "$VERBOSE" = true ]; then
        # Verbose mode: show output in console AND log to file
        if eval "$command" 2>&1 | tee -a "$LOG_FILE"; then
            log_message "✅ $check_name completed successfully"
            log_message ""
            print_success "$check_name passed"
            return 0
        else
            local exit_code=$?
            log_message "❌ $check_name failed with exit code: $exit_code"
            log_message ""
            print_error "$check_name failed"
            return 1
        fi
    else
        # No logging: show all output in console
        if eval "$command"; then
            print_success "$check_name passed"
            return 0
        else
            print_error "$check_name failed"
            return 1
        fi
    fi
}

# Initialize variables to track failures
FAILED_CHECKS=""
TOTAL_CHECKS=0

# Function to add failed check
add_failed_check() {
    if [ -z "$FAILED_CHECKS" ]; then
        FAILED_CHECKS="$1"
    else
        FAILED_CHECKS="$FAILED_CHECKS $1"
    fi
}

# Function to count failed checks
count_failed_checks() {
    if [ -z "$FAILED_CHECKS" ]; then
        echo 0
    else
        echo "$FAILED_CHECKS" | wc -w
    fi
}

# Initialize logging
init_logging

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Make sure you're in the project root directory."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    log_message "Installing dependencies..."

    if [ "$ENABLE_LOGGING" = true ] && [ "$VERBOSE" = false ]; then
        npm install >> "$LOG_FILE" 2>&1
    elif [ "$ENABLE_LOGGING" = true ] && [ "$VERBOSE" = true ]; then
        npm install 2>&1 | tee -a "$LOG_FILE"
    else
        npm install
    fi
fi

echo ""
echo "🔍 Starting checks..."
echo "===================="

# 1. ESLint check
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if ! run_check "ESLint" "npm run lint"; then
    add_failed_check "ESLint"
fi

echo ""

# 2. TypeScript compilation check
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if ! run_check "TypeScript compilation" "npx tsc --noEmit"; then
    add_failed_check "TypeScript_compilation"
fi

echo ""

# 3. Unit tests
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if ! run_check "Unit tests" "npm test"; then
    add_failed_check "Unit_tests"
fi

echo ""

# 4. Build check
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if ! run_check "Build" "npm run build"; then
    add_failed_check "Build"
fi

echo ""

# 5. Vulnerability check
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if ! run_check "Security vulnerabilities" "npm run vulnerabilities"; then
    add_failed_check "Security_vulnerabilities"
fi

echo ""

# Optional: E2E tests (if they exist)
if grep -q "test:e2e" package.json; then
    echo "🧪 E2E tests found in package.json"
    printf "Do you want to run E2E tests? (y/n): "
    read -r reply
    case "$reply" in
        [Yy]|[Yy][Ee][Ss])
            TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
            if ! run_check "E2E tests" "npm run test:e2e"; then
                add_failed_check "E2E_tests"
            fi
            echo ""
            ;;
    esac
fi

# Count failed checks
FAILED_COUNT=$(count_failed_checks)

# Log final summary
if [ "$ENABLE_LOGGING" = true ]; then
    log_message "=== FINAL SUMMARY ==="
    log_message "Total checks run: $TOTAL_CHECKS"
    log_message "Failed checks: $FAILED_COUNT"
    if [ "$FAILED_COUNT" -gt 0 ]; then
        log_message "Failed checks list:"
        for check in $FAILED_CHECKS; do
            log_message "  - $check"
        done
    fi
    log_message "Completed at: $(date)"
fi

# Summary
echo "📊 SUMMARY"
echo "=========="
echo "Total checks run: $TOTAL_CHECKS"
echo "Failed checks: $FAILED_COUNT"

if [ "$FAILED_COUNT" -eq 0 ]; then
    print_success "All checks passed! 🎉"
    echo ""
    echo "The project is ready for deployment or commit."
    if [ "$ENABLE_LOGGING" = true ]; then
        print_info "Full execution log saved to: $LOG_FILE"
    fi
    exit 0
else
    print_error "Some checks failed:"
    for check in $FAILED_CHECKS; do
        echo "  - $check"
    done
    echo ""
    if [ "$ENABLE_LOGGING" = true ] && [ "$VERBOSE" = false ]; then
        print_info "Check $LOG_FILE for detailed error messages"
    fi
    echo "Please fix the issues above before proceeding."
    exit 1
fi