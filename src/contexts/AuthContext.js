const signUp = async (email, password, userData) => {
  try {
    console.log('Attempting to sign up with email:', email)
    console.log('Supabase URL:', supabase.supabaseUrl)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    console.log('Supabase auth response:', { data, error })

    if (error) {
      console.error('Auth error:', error)
      throw error
    }

    if (data.user) {
      const userId = data.user.id
      console.log('User created with ID:', userId)

      const profileToInsert = {
        id: userId,
        email: data.user.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        age: userData.age,
        city: userData.city,
        state: userData.state,
        sport: userData.sport,
        additional_sport: userData.additionalSport || null,
        role: userData.role,
        profile_picture_url: userData.profilePictureUrl || null,
        hourly_rate: userData.hourlyRate ? parseFloat(userData.hourlyRate) : null,
        teaching_areas: userData.teachingAreas || [],
        improvement_areas: userData.improvementAreas || [],
        created_at: new Date().toISOString(),
      }

      // Wait until user is present in auth.users table before inserting profile
      let userReady = false
      for (let attempt = 1; attempt <= 5; attempt++) {
        const { data: userCheck, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)

        if (checkError) {
          console.error(`Attempt ${attempt}: Error checking user readiness`, checkError)
        }

        if (userCheck.length === 0) {
          console.log(`Waiting for user to be available... (attempt ${attempt})`)
          await new Promise((res) => setTimeout(res, 500))
        } else {
          userReady = true
          break
        }
      }

      if (!userReady) {
        console.error('User record not ready for profile creation.')
        throw new Error('Please try signing up again in a moment.')
      }

      // Insert profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([profileToInsert])

      if (profileError) {
        console.error('Profile creation error:', profileError)
        throw profileError
      }

      // Upload profile picture if needed
      if (userData.profilePictureUrl && userData.profilePictureUrl.startsWith('data:')) {
        try {
          console.log('Uploading profile picture...')
          await uploadProfilePictureFromDataUrl(userId, userData.profilePictureUrl)
        } catch (uploadError) {
          console.error('Profile picture upload failed:', uploadError)
        }
      }

      // Trigger welcome email via Supabase function
      try {
        const welcomeEmailData = {
          userType: userData.role,
          recipientEmail: data.user.email,
          recipientName: `${userData.firstName} ${userData.lastName}`,
          dashboardURL: 'http://127.0.0.1:3000/dashboard',
          mentorsURL: 'http://127.0.0.1:3000/mentors'
        }

        const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
          body: welcomeEmailData
        })

        if (emailError) {
          console.error('Error sending welcome email:', emailError)
        } else {
          console.log('Welcome email sent successfully')
        }
      } catch (emailError) {
        console.error('Email function error:', emailError)
      }

      // Sign out user immediately (force email verification flow)
      await supabase.auth.signOut()

      // Clear all Supabase auth tokens
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('sb-')) localStorage.removeItem(key)
        })
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith('sb-')) sessionStorage.removeItem(key)
        })
        console.log('Cleared Supabase tokens from storage')
      } catch (storageError) {
        console.error('Failed to clear auth storage:', storageError)
      }
    }

    return { data, error: null }
  } catch (error) {
    console.error('SignUp error:', error)
    return { data: null, error }
  }
}