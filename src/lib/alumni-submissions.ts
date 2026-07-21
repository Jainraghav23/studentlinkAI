export const getSubmissionErrorMessage = (error: { code?: string; message?: string } | null | undefined) => {
  if (!error) return "Account created but submission failed. Please contact support.";

  const message = error.message || "";
  if (
    error.code === "23505" ||
    message.includes("alumni_submissions_pending_email_unique")
  ) {
    return "This email already has a profile waiting for admin approval. Please wait until it is approved before submitting again.";
  }

  return message || "Account created but submission failed. Please contact support.";
};
