interface MenuBarProps {}

export default function MenuBar(props: MenuBarProps) {
  return (
    <nav style={styles.container}>
      {["File", "Edit", "View", "Export"].map((item) => (
        <button key={item} style={styles.menuItem}>
          {item}
        </button>
      ))}
      <div style={styles.spacer} />
      <button style={styles.brandLabel}>DCL 3D Modeler v0.1.0</button>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    height: "100%",
    flex: 1,
    gap: 2,
  },
  menuItem: {
    padding: "4px 10px",
    fontSize: 12,
    borderRadius: 4,
    transition: "background 0.15s",
  },
  spacer: {
    flex: 1,
  },
  brandLabel: {
    fontSize: 11,
    color: "var(--text-secondary)",
    fontWeight: 600,
    letterSpacing: 0.5,
  },
};
