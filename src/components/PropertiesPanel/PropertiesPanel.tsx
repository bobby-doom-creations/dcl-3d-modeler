export default function PropertiesPanel() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerText}>Properties</span>
      </div>

      <div style={styles.sections}>
        {/* Transform */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Transform</h3>
          <div style={styles.sectionBody}>
            <PropertyRow label="Position" prefix="pos" />
            <PropertyRow label="Rotation" prefix="rot" />
            <PropertyRow label="Scale" prefix="scl" />
          </div>
        </div>

        {/* Mesh Info */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Mesh</h3>
          <div style={styles.sectionBody}>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Vertices</span>
              <span style={styles.statValue}>—</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Faces</span>
              <span style={styles.statValue}>—</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Edges</span>
              <span style={styles.statValue}>—</span>
            </div>
          </div>
        </div>

        {/* Material */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Material</h3>
          <div style={styles.sectionBody}>
            <div style={styles.colorRow}>
              <span style={styles.statLabel}>Color</span>
              <div style={styles.colorPicker}>
                <div style={styles.colorSwatch} />
              </div>
            </div>
            <PropertyRow label="Roughness" prefix="rgh" />
            <PropertyRow label="Metalness" prefix="met" />
          </div>
        </div>

        {/* Actions */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Actions</h3>
          <div style={styles.actions}>
            <button style={styles.actionBtn}>Delete</button>
            <button style={styles.actionBtn}>Clone</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertyRow({ label, prefix }: { label: string; prefix: string }) {
  return (
    <div style={styles.propRow}>
      <span style={styles.propLabel}>{label}</span>
      <div style={styles.propInputs}>
        <Input label={prefix + "x"} />
        <Input label={prefix + "y"} />
        <Input label={prefix + "z"} />
      </div>
    </div>
  );
}

function Input({ label }: { label: string }) {
  return (
    <div style={styles.inputGroup}>
      <span style={styles.inputLabel}>{label}</span>
      <input type="text" defaultValue="0.00" />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 12,
  },
  header: {
    padding: "4px 0 12px",
    borderBottom: "1px solid var(--border-color)",
  },
  headerText: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "var(--text-secondary)",
  },
  sections: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    marginTop: 12,
  },
  section: {
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "var(--text-secondary)",
    marginBottom: 8,
  },
  sectionBody: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "2px 0",
  },
  statLabel: {
    fontSize: 11,
    color: "var(--text-secondary)",
  },
  statValue: {
    fontSize: 11,
    fontFamily: "monospace",
    color: "var(--accent-green)",
  },
  colorRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "2px 0",
  },
  colorPicker: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 4,
    background: "var(--accent-blue)",
    border: "1px solid var(--border-color)",
  },
  propRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  propLabel: {
    width: 60,
    fontSize: 11,
    color: "var(--text-secondary)",
    flexShrink: 0,
  },
  propInputs: {
    display: "flex",
    gap: 4,
    flex: 1,
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
  },
  inputLabel: {
    fontSize: 9,
    color: "var(--text-muted)",
    fontWeight: 600,
  },
  actions: {
    display: "flex",
    gap: 6,
  },
  actionBtn: {
    flex: 1,
    padding: "4px 8px",
    fontSize: 11,
    borderRadius: 4,
    background: "var(--bg-tertiary)",
    border: "1px solid var(--border-color)",
    transition: "all 0.15s",
  },
};
