import PropTypes from "prop-types";

// Shows "Rolling..." while waiting for the server, or an error message.
export default function GameStatusMessage({ isRolling, error }) {
  if (error) {
    return (
      <p role="alert" className="w-full rounded-lg border border-red-400/50 bg-red-500/20 p-2 text-center text-sm text-red-100">
        {error}
      </p>
    );
  }

  if (isRolling) {
    return (
      <p aria-live="polite" className="text-center text-sm text-white/80">
        Rolling...
      </p>
    );
  }

  return null;
}

GameStatusMessage.propTypes = {
  isRolling: PropTypes.bool,
  error: PropTypes.string,
};
