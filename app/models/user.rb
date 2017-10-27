class User < ActiveRecord::Base

  has_many :orders
  has_many :searches
  has_many :payments, through: :orders

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :omniauthable, :omniauth_providers => [:facebook]

  validates_presence_of     :email
  validates                 :email, uniqueness: true
#  validates_confirmation_of :password

  def detailsChanged?(user_params)
    self.first_name != user_params[:first_name] ||
    self.last_name != user_params[:last_name]
  end


  def self.from_omniauth(auth)
    # TODO: Handle users who already signed with user/pwd properly
    user = where(email: auth.info.email).first || where(provider: auth.provider, uid: auth.uid).first_or_create    
    user.email = auth.info.email  
    user.password = Devise.friendly_token[0,20] unless user.encrypted_password
    user.name = auth.info.name   
    user.image = auth.info.image
    user.location = auth.info.location
    user.first_name = auth.extra.raw_info.first_name if auth.extra and auth.extra.raw_info 
    user.last_name = auth.extra.raw_info.last_name if auth.extra and auth.extra.raw_info 
    user.timezone = auth.extra.raw_info.timezone if auth.extra and auth.extra.raw_info 
    user.gender = auth.extra.raw_info.gender if auth.extra and auth.extra.raw_info 
    user.locale = auth.extra.raw_info.locale if auth.extra and auth.extra.raw_info 
    user.provider = auth.provider
    user.uid = auth.uid
    user.save 
    user       
  end
  
  def self.new_with_session(params, session)
    super.tap do |user|
      if data = session["devise.facebook_data"] && session["devise.facebook_data"]["extra"]["raw_info"]
        user.email = data["email"] if user.email.blank?
      end
    end
  end

  def name
    @name = self.first_name
    @name += (' ' + self.last_name) if self.last_name
    @name
  end

  def name=(fullname)
    split = fullname.split(" ")
    self.first_name = split[0]
    self.last_name = split[1] if split[1]
  end

  def delivery_address
    return nil unless self.house && self.street && self.city
    "#{self.street} #{self.house}, #{self.city}"
  end

end
