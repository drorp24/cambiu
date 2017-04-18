class User < ActiveRecord::Base
  has_many :orders
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :omniauthable, :omniauth_providers => [:facebook]

   validates_presence_of :email

  def self.new_guest(params)
    new({guest: true, email: params[:email] || Devise.friendly_token.first(8)}.merge(params))
  end
  
  def password_required?
     new_record? ? false : super
     false
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

end
