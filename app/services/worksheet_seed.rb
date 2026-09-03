# Deterministic seed for worksheet randomisation. Re-printing today's sheet
# gives the identical sheet; "generate new practice" bumps the variant and
# gives a different one. `key` is any stable identifier — a skill code or a
# worksheet catalog code.
class WorksheetSeed
  def self.for(child:, key: nil, skill: nil, date: Date.current, variant: 0)
    key ||= skill&.code
    Zlib.crc32("#{child.id}-#{key}-#{date.iso8601}-#{variant}")
  end
end
