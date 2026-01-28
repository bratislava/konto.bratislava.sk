-- Rename activeEdeskUpdatedAt to edeskStatusChangedAt
Alter TABLE "PhysicalEntity"
    RENAME COLUMN "activeEdeskUpdatedAt" to "edeskStatusChangedAt";
-- TODO create new column, we probably need the old one

-- Add trigger to update edeskStatusChangedAt if activeEdesk changes
CREATE OR REPLACE FUNCTION physical_entity_set_edesk_changed_at()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    IF NEW."activeEdesk" IS DISTINCT FROM OLD."activeEdesk"
        AND NOT (OLD."activeEdesk" IS NULL AND NEW."activeEdesk" = false) -- We want to skip update in this case.
    THEN
        NEW."edeskStatusChangedAt" := now();
    ELSE
        NEW."edeskStatusChangedAt" := OLD."edeskStatusChangedAt";
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_physical_entity_set_edesk_changed_at
    BEFORE UPDATE OF "activeEdesk"
    ON "PhysicalEntity"
    FOR EACH ROW
EXECUTE PROCEDURE physical_entity_set_edesk_changed_at();


-- Prevent manual updates of edeskStatusChangedAt
CREATE OR REPLACE FUNCTION physical_entity_prevent_manual_edesk_changed_at()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    NEW."edeskStatusChangedAt" := OLD."edeskStatusChangedAt";
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_physical_entity_prevent_manual_edesk_changed_at ON "PhysicalEntity";
CREATE TRIGGER trg_physical_entity_prevent_manual_edesk_changed_at
    BEFORE UPDATE OF "edeskStatusChangedAt"
    ON "PhysicalEntity"
    FOR EACH ROW
EXECUTE PROCEDURE physical_entity_prevent_manual_edesk_changed_at();
