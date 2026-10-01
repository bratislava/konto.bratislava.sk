ALTER TABLE "Forms" ADD CONSTRAINT "form_sent_at_required_when_not_draft" CHECK ("state" = 'DRAFT' OR "formSentAt" IS NOT NULL);
