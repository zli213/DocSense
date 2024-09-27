import re
import os


def check_chinese_in_comments(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    chinese_pattern = re.compile(r'[\u4e00-\u9fff]')
    comment_pattern = re.compile(r'^\s*#|//|/\*|\*|<!--|-->')
    violations = []

    for line_number, line in enumerate(lines, start=1):
        if comment_pattern.search(line) and chinese_pattern.search(line):
            violations.append(f"{file_path}, line: {line_number}")

    return violations


def scan_directory(directory):
    all_violations = []
    for root, dirs, files in os.walk(directory):
        # Skip node_modules and .next directories
        if 'node_modules' in root or '.next' in root:
            continue

        for file in files:
            if file.endswith(('.py', '.js', '.java', '.cpp', '.c', '.html', '.css', '.jsx')):
                file_path = os.path.join(root, file)
                violations = check_chinese_in_comments(file_path)
                if violations:
                    all_violations.extend(violations)

    return all_violations


if __name__ == "__main__":
    violations = scan_directory('.')
    if violations:
        print("Chinese characters found in comments in the following files:")
        for violation in violations:
            print(violation)
        print("Error: Chinese characters found in comments.")
        exit(1)
    else:
        print("No Chinese characters found in comments.")
        exit(0)
