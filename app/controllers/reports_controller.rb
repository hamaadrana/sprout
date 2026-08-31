class ReportsController < ApplicationController
  before_action :require_child!

  def show
    render inertia: "Report", props: report_props
  end

  def share
    render inertia: "ShareCard", props: report_props
  end

  private

  def report_props
    month = parse_month
    ReportBuilder.new(current_child, month).props
  end

  def parse_month
    Date.strptime(params[:month], "%Y-%m")
  rescue ArgumentError, TypeError
    Date.current.beginning_of_month
  end
end
