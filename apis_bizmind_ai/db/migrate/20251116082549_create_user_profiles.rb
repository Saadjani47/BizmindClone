class CreateUserProfiles < ActiveRecord::Migration[7.1]
  def change
    create_table :user_profiles, if_not_exists: true do |t|
      t.references :user, null: false, foreign_key: true
      t.string :first_name, null: false
      t.string :last_name
      t.string :full_name, null: false
      t.string :headline
      t.string :job_title
      t.string :company
      t.string :location
      t.string :website
      t.string :linkedin_url
      t.text   :summary
      t.jsonb  :skills, default: []

      t.timestamps
    end

    # ensure a user has at most one profile (replace non-unique if it exists)
    if index_exists?(:user_profiles, :user_id, name: "index_user_profiles_on_user_id") &&
       !index_exists?(:user_profiles, :user_id, unique: true, name: "index_user_profiles_on_user_id")
      remove_index :user_profiles, name: "index_user_profiles_on_user_id"
    end
    add_index :user_profiles, :user_id, unique: true, name: "index_user_profiles_on_user_id", if_not_exists: true

    # helpful for name lookups/search
    add_index :user_profiles, :full_name, if_not_exists: true
    # GIN index for jsonb array queries on skills
    add_index :user_profiles, :skills, using: :gin, if_not_exists: true
  end
end
