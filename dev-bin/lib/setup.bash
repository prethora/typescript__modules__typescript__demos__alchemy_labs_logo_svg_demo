function _processHelp
{
    if [[ "$#" == 1 ]] && [[ "$1" =~ ^(-h)|(--help)$ ]]; then

cat << EOF
Interactively setup this project.

USAGE

  ./dev-bin/setup [OPTIONS]

OPTIONS

  -y,--yes          automatically answer 'y' to all interactive confirmation messages.
  -h,--help         show this help page.

EOF

        exit 0
    fi
}

function _isCustomizable
{
    [[ -f "$PACKAGEJSON_PATH" ]] && 
    [[ "$(cat "$PACKAGEJSON_PATH")" =~ \{\{name\}\}.*\{\{description\}\}.*\{\{name\}\} ]] && 
    [[ -f "$README_PATH" ]] && 
    [[ "$(cat "$README_PATH")" =~ \{\{name\}\}.*\{\{description\}\} ]]
}

function _readName
{
    local BREAK="0"
    while [[ "$BREAK" == "0" ]] ; do
        printf "${WHITE}Name${NC}: "
        read -r
        if [[ "$REPLY" =~ ^[[:space:]]*([a-zA-Z][a-zA-Z0-9\_]*)[[:space:]]*$ ]]; then
            NAME="${BASH_REMATCH[1]}"
            BREAK="1"
        else
            echo " * error: invalid name"
        fi
    done
}

function _readDescription
{
    local BREAK="0"
    while [[ "$BREAK" == "0" ]] ; do
        printf "${WHITE}Description${NC}: "
        read -r
        REPLY="$(echo "${REPLY}" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
        if [[ ! -z "$REPLY" ]]; then
            DESCRIPTION="$REPLY"
            BREAK="1"
        else
            echo " * error: description cannot be empty"
        fi
    done
}

function _replaceTags
{
    local SOURCE_FILE="$PACKAGEJSON_PATH"
    local SWAP_FILE="$SOURCE_FILE.swap"
    local ESCAPED_DESCRIPTION="$(jsonEscape "$(jsonEscape "$DESCRIPTION")")"
    sed "s/{{name}}/$NAME/g; s/{{description}}/$ESCAPED_DESCRIPTION/g" "$SOURCE_FILE" > "$SWAP_FILE"
    mv "$SWAP_FILE" "$SOURCE_FILE"

    SOURCE_FILE="$README_PATH"
    SWAP_FILE="$SOURCE_FILE.swap"
    sed "s/{{name}}/$NAME/g; s/{{description}}/$DESCRIPTION/g" "$SOURCE_FILE" > "$SWAP_FILE"
    mv "$SWAP_FILE" "$SOURCE_FILE"

    echo ""
}

function _manageRepo1
{
    rm -rf .git
    local REPO="git@prethora.github.com:prethora/typescript__modules__$NAME"
    printAction "git init"
    git init; echo ""
    printAction "git remote add origin $REPO"
    git remote add origin "$REPO";
    local GIT_URL="$(git remote get-url origin)"
    if [[ "$GIT_URL" =~ ^git@([a-zA-Z][a-zA-Z0-9\_\-]*)\.github\.com:([a-zA-Z][a-zA-Z0-9\_\-]*\/[a-zA-Z][a-zA-Z0-9\_\-]*)(\.git)?$ ]]; then
        local ACCOUNT_NAME="${BASH_REMATCH[1]}"
        local REPO_NAME="${BASH_REMATCH[2]}"
        if [[ -f ~/.config/gh/accounts/"$ACCOUNT_NAME".yml ]]; then
            if ! repoExists "$ACCOUNT_NAME" "$REPO_NAME" ; then
                if [[ "$YES" == 1 ]] || confirm "Would you like to create this repo on github.com?" "y"; then
                    local BREAK=0
                    while [[ "$BREAK" == "0" ]]; do
                        if createRepo "$ACCOUNT_NAME" "$REPO_NAME" "$DESCRIPTION" 1; then
                            [[ "$YES" == 1 ]] && printInfo "created remote repo on github.com"
                            REPO_EXISTS=1
                            BREAK="1"
                        else
                            echo " * error: was unable to create repo"
                            if ! confirm "Would you like to retry" "y"; then
                                BREAK="1"
                            fi
                        fi
                    done
                fi
                [[ "$YES" != 1 ]] && echo ""
            else
                if [[ "$YES" == 1 ]] || confirm "Remote repo already exists, would you like to reset it?" "y"; then
                    silentCleanupRemoteRepo
                    [[ "$YES" == 1 ]] && printInfo "reset existing remote repo on github.com"
                fi
                [[ "$YES" != 1 ]] && echo ""
                REPO_EXISTS=1
            fi                
        fi            
    fi
}

function _npmInstall
{
    printAction "npm install"
    npm install; echo ""
}

function _manageRepo2
{
    if [[ "$YES" == 1 ]] || confirm "Would you like to create an initial commit for the master branch?" "y"; then
        [[ "$YES" != 1 ]] && echo ""
        printAction "git add -A"
        git add -A
        printAction "git commit -m \"Initial commit\""
        git commit -m "Initial commit"; echo ""
        if [[ "$REPO_EXISTS" == 1 ]]; then
            if [[ "$YES" == 1 ]] || confirm "Would you like to push the initial commit to origin?" "y"; then
                [[ "$YES" != 1 ]] && echo ""
                printAction "git push -u origin +master"
                git push -u origin +master; echo ""
            fi
        else
            echo ""
        fi
    else
        echo ""
    fi
}

function _loadArgs
{
    local ARGS=( "$@" )
    
    extractFlag "-y" "--yes" "|" "${ARGS[@]}"
    YES="$EF_FLAG"
    ARGS=( "${EF_REMAINING_ARGS[@]}" )

    if [[ "${#ARGS[@]}" -gt 0 ]]; then
        echo "fatal: not expecting any arguments"
        exit 1
    fi
}