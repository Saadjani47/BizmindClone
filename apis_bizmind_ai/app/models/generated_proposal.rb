class GeneratedProposal < ApplicationRecord
  belongs_to :proposal

  # Convenience getters for the structured JSON sections
  def project_title = content_sections['project_title']
  def introduction = content_sections['introduction']
  def problem_statement = content_sections['problem_statement']
  def proposed_system = content_sections['proposed_system']
  def expected_outcomes = content_sections['expected_outcomes']
  def tools_and_technology = content_sections['tools_and_technology']

  def objectives
    content_sections['objectives'] || []
  end

  def main_modules
    content_sections['main_modules'] || []
  end
end
