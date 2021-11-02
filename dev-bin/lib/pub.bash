function _processHelp
{
    if [[ "$#" == 1 ]] && [[ "$1" =~ ^(-h)|(--help)$ ]]; then

cat << EOF
Create a tag on HEAD (only on the master branch) matching the version field in the package.json file,
prefixed with a 'v', and push the tag to origin. Only works if there are no local changes. 

USAGE

  ./dev-bin/pub [OPTIONS]

OPTIONS

  -y,--yes      automatically answer 'y' to all interactive confirmation messages.
  -h,--help     show this help page.

EOF

        exit 0
    fi
}

function _loadArgs
{
    local ARGS=( "$@" )
    
    extractFlag "-y" "--yes" "|" "${ARGS[@]}"
    YES="$EF_FLAG"
    ARGS=( "${EF_REMAINING_ARGS[@]}" )

    if [[ "${#ARGS[@]}" -gt 0 ]]; then
        echo "fatal: expecting no arguments"
        exit 1
    fi
}

function validatePublishable
{
    local CURRENT_BRANCH="$(getCurrentBranch)"
    [[ "$CURRENT_BRANCH" != "master" ]] && echo "fatal: can only publish from the master branch" && exit 1

    local MASTER_COMMIT_COUNT=$(getCommitCount "master")
    [[ "$MASTER_COMMIT_COUNT" == 0 ]] && echo "fatal: the master branch must be saved before being published" && exit 1

    isSaveable && echo -e "fatal: you cannot publish the master branch with working changes - save it first, or run \`git stash push -u\` \nto stash the changes and run \`git stash pop\` after publishing to restore them." && exit 1
}

function getPackageVersion
{
    node -e "console.log(require('./package.json').version)"
}

function validateVersion
{
    node "./dev-bin/lib/pub_validate_version.js"
    [[ "$?" != 0 ]] && exit 1
}