# Deterministic seed for worksheet randomisation. Re-printing today's sheet
# gives the identical sheet; "generate new practice" bumps the variant and
# gives a different one.
class WorksheetSeed
  def self.for(child:, skill:, date: Date.current, variant: 0)
    Zlib.crc32("#{child.id}-#{skill.code}-#{date.iso8601}-#{variant}")
  end
end
