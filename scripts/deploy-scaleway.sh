#!/usr/bin/env bash
#
# Deploy the Evenue image to the Scaleway Serverless Container.
#
# This script must FAIL LOUDLY. The previous version swallowed stderr and ended with
# `|| echo`, so the CI job stayed green while nothing was ever deployed — production
# silently drifted several commits behind main.
#
# Required environment:
#   SCW_CONTAINER_ID   UUID of the serverless container (Console → Containers → your
#                      container → "Container ID"). NOT the container name.
#   IMAGE_URI          Full registry image reference to deploy, tag included.
#
# The Scaleway CLI credentials (SCW_ACCESS_KEY / SCW_SECRET_KEY / SCW_DEFAULT_PROJECT_ID)
# are read by `scw` itself and are set up by the scaleway/action-scw step in CI.

set -euo pipefail

CONTAINER_ID="${SCW_CONTAINER_ID:-}"
IMAGE_URI="${IMAGE_URI:-rg.fr-par.scw.cloud/evenue/evenue-app:latest}"
POLL_TIMEOUT_SECONDS="${POLL_TIMEOUT_SECONDS:-300}"

if [ -z "$CONTAINER_ID" ]; then
	echo "❌ SCW_CONTAINER_ID is not set — refusing to pretend a deployment happened." >&2
	exit 1
fi

if ! command -v scw >/dev/null 2>&1; then
	echo "❌ Scaleway CLI (scw) not found. Install it or run this from the CI pipeline." >&2
	exit 1
fi

# The CLI's own "No credentials provided" fires halfway through the deployment and reads
# like a Scaleway outage rather than a CI misconfiguration. Check up front instead, and name
# the offending variable: a GitHub secret that exists but holds an empty value looks exactly
# like a correctly configured one in every listing, which is a long thing to work out.
if [ -z "${SCW_ACCESS_KEY:-}" ] || [ -z "${SCW_SECRET_KEY:-}" ]; then
	if [ ! -f "${HOME}/.config/scw/config.yaml" ]; then
		echo "❌ Missing Scaleway credentials." >&2
		[ -z "${SCW_ACCESS_KEY:-}" ] && echo "   - SCW_ACCESS_KEY is empty or unset" >&2
		[ -z "${SCW_SECRET_KEY:-}" ] && echo "   - SCW_SECRET_KEY is empty or unset" >&2
		# Lengths only — never the values. Enough to tell "empty" from "wrong".
		echo "   (lengths: access-key=${#SCW_ACCESS_KEY} secret-key=${#SCW_SECRET_KEY})" >&2
		echo "   In CI these come from repository secrets. A secret can exist with an empty" >&2
		echo "   value: re-set it from the GitHub UI and check the value is really stored." >&2
		echo "   Locally, run 'scw init' instead." >&2
		exit 1
	fi
fi

echo "🚀 Deploying $IMAGE_URI to serverless container $CONTAINER_ID..."

# Updating the registry image both pins the exact build being shipped (traceable, and
# rollback is just re-running with the previous tag) and triggers a new deployment.
scw container container update "$CONTAINER_ID" image="$IMAGE_URI"

echo "⏳ Waiting for the new deployment to become ready..."

deadline=$(( SECONDS + POLL_TIMEOUT_SECONDS ))
status=""
raw_reported=false

while [ "$SECONDS" -lt "$deadline" ]; do
	payload=$(scw container container get "$CONTAINER_ID" -o json 2>&1) || payload=""

	# `-o json` emits compact, single-line JSON: nothing can be matched line by line.
	# Split on commas first, then read the first "status" field. Deliberately no jq —
	# it is not guaranteed to be installed wherever this script runs.
	status=$(printf '%s' "$payload" \
		| tr ',' '\n' \
		| grep -m1 '"status"' \
		| sed 's/.*"status"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

	# Without this, an unparsable response loops silently for five minutes and reports a
	# timeout on a deployment that actually succeeded.
	if [ -z "$status" ] && [ "$raw_reported" = "false" ]; then
		raw_reported=true
		echo "⚠️  Could not read the container status. Raw response:" >&2
		printf '%s\n' "$payload" | head -c 500 >&2
		echo >&2
	fi

	case "$status" in
		ready)
			echo "✅ Container is ready — $IMAGE_URI is live."
			exit 0
			;;
		error|locked)
			echo "❌ Deployment failed (status: $status). Check the container logs in Cockpit." >&2
			exit 1
			;;
		*)
			echo "   status: ${status:-unknown}"
			sleep 10
			;;
	esac
done

echo "❌ Timed out after ${POLL_TIMEOUT_SECONDS}s waiting for the container (last status: ${status:-unknown})." >&2
exit 1
