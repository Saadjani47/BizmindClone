class CreateUserPreferences < ActiveRecord::Migration[7.1]
  def change
    create_table :user_preferences do |t|
      t.string :theme
      t.string :language
      t.belongs_to :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
