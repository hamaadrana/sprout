module WorksheetsHelper
  # Small self-drawn SVG shapes — no third-party clipart, no licences.
  SHAPES = {
    "star" => '<path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2l-6.1 3.4 1.4-6.8L2.2 9.1l6.9-.8z" fill="#e9a83a" stroke="#22301f" stroke-width="1"/>',
    "heart" => '<path d="M12 21C6 16 2.5 12.3 2.5 8.6 2.5 6 4.6 4 7.1 4c1.9 0 3.6 1 4.9 2.8C13.3 5 15 4 16.9 4c2.5 0 4.6 2 4.6 4.6 0 3.7-3.5 7.4-9.5 12.4z" fill="#bf5b3d" stroke="#22301f" stroke-width="1"/>',
    "ball" => '<circle cx="12" cy="12" r="9.5" fill="#2b5540" stroke="#22301f" stroke-width="1"/><path d="M2.5 12h19M12 2.5c3 2.6 3 16.4 0 19" fill="none" stroke="#faf6ee" stroke-width="1.4"/>',
    "leaf" => '<path d="M20 4C10 4 4 10 4 20c10 0 16-6 16-16z" fill="#7a9b6d" stroke="#22301f" stroke-width="1"/><path d="M6 18C9 14 14 9 18 6" fill="none" stroke="#22301f" stroke-width="1"/>',
    "fish" => '<path d="M3 12c3-4.5 7-6.5 11-6.5 3.5 0 6 3 7 6.5-1 3.5-3.5 6.5-7 6.5-4 0-8-2-11-6.5z" fill="#5a8bab" stroke="#22301f" stroke-width="1"/><path d="M3 12l-1.8-3v6z" fill="#5a8bab" stroke="#22301f" stroke-width="1"/><circle cx="16.5" cy="10.5" r="1" fill="#22301f"/>'
  }.freeze

  def worksheet_shape(name, size_mm: 9)
    inner = SHAPES.fetch(name, SHAPES["ball"])
    raw(%(<svg viewBox="0 0 24 24" width="#{size_mm}mm" height="#{size_mm}mm" xmlns="http://www.w3.org/2000/svg">#{inner}</svg>))
  end

  GEOMETRY = {
    "circle" => '<circle cx="12" cy="12" r="10"/>',
    "square" => '<rect x="2.5" y="2.5" width="19" height="19"/>',
    "triangle" => '<path d="M12 3L21.5 21H2.5z"/>',
    "rectangle" => '<rect x="1.5" y="6" width="21" height="12"/>',
    "oval" => '<ellipse cx="12" cy="12" rx="10.5" ry="7"/>'
  }.freeze

  PATTERN_FILLS = {
    "circle" => "#2b5540",
    "square" => "#e9a83a",
    "triangle" => "#bf5b3d"
  }.freeze

  # Dashed grey outline for tracing.
  def worksheet_traceable(name, size_mm: 22)
    inner = GEOMETRY.fetch(name, GEOMETRY["circle"])
    raw(%(<svg viewBox="0 0 24 24" width="#{size_mm}mm" height="#{size_mm}mm" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#9a9a9a" stroke-width="0.9" stroke-dasharray="2.2 1.8">#{inner}</g></svg>))
  end

  # Solid filled geometry, coloured per shape so patterns read clearly.
  def worksheet_solid(name, size_mm: 10)
    inner = GEOMETRY.fetch(name, GEOMETRY["circle"])
    fill = PATTERN_FILLS.fetch(name, "#2b5540")
    raw(%(<svg viewBox="0 0 24 24" width="#{size_mm}mm" height="#{size_mm}mm" xmlns="http://www.w3.org/2000/svg"><g fill="#{fill}" stroke="#22301f" stroke-width="0.8">#{inner}</g></svg>))
  end
end
