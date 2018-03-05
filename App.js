import React from 'react'
import styled from 'styled-components/native'
import sortOn from 'sort-on'

import { yelp, token } from './config'
import fixture from './fixture'

import {
  Image,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  View,
  Animated,
  ScrollView,
  Button
} from 'react-native'

import { Location, Permissions, BlurView } from 'expo'

const defaultState = {
  latitude: '',
  longitude: '',
  businesses: []
}

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null
  }

  state = defaultState

  async componentDidMount () {
    await this.getLocationAsync()
  }

  getLocationAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION)

    if (status === 'granted') {
      const { coords: { latitude, longitude } } = await Location.getCurrentPositionAsync()

      this.setState({ latitude, longitude }, this.getBusinesses)
    } else {
      const { businesses } = fixture

      this.setState({ businesses })
    }
  }

  visit = async place => {
    var serializeJSON = function(data) {
      return Object.keys(data).map(function (keyName) {
        return encodeURIComponent(keyName) + '=' + encodeURIComponent(data[keyName])
      }).join('&');
    }

    let body = {
      method: 'POST',
      headers: {
        'x-auth-token': token
      },
      body: serializeJSON({ business_id: place.id, location_service_types: 'wifi' })
    }

    const url = `https://auto-api.yelp.com/check_in?accuracy=0.007456&app_version=12.1.0&cc=US&device_type=iPhone10%2C6%2F11.2.1&efs=0HweRIEwPM0OnQpUuqU6ki9efWSQIVNIck8W9lIWp5VIVKpdpKPQldQWZzXUx9sw4L4lcssBTqs9wnOXLxHORWXJRhzMgCSzydKL5hXU%2BTryIg200sPGECvVPdnyj%2FrK&lang=en&locale=en_US&nonce=F57B85CE-835F-4D6A-942D-969E892048F5&signature=OYYpGesvlbhqjuwEoagCYQ%3D%3D&time=${Date.now()}&ywsid=gpfz_nbS33avFWL0Ozgz3Q`

    console.log(body)
    try {
      const res = await fetch(url, body)
      console.log(res)
    } catch (err) {
      console.error(err)
    }

  }

  getBusinesses = async () => {
    const res = await fetch(`https://auto-api.yelp.com/nearby/suggest?accuracy=0.040389&app_version=12.1.0&cc=US&device_type=iPhone10%2C6%2F11.2.1&efs=hJ4yK9kdYRPeEHYOBjz23NJpEEJqZ9nTx2%2FlMhrIoW8lloANKI3HItn7FsM8FQR1rEGf9pTrzwYO%2Fye0slYSxy9%2BJPQcEJwjKyXi1%2BbtiGxfKOcQQxhnq5e92JZFA82V&lang=en&locale=en_US&signature=lJiT4NfX%2BzsC8F4YAsBArQ%3D%3D&time=1514854306&ywsid=gpfz_nbS33avFWL0Ozgz3Q`)
    let { businesses } = await res.json()

    businesses = sortOn(businesses, 'distance')

    this.setState({ businesses, showLocate: false })
  }

  render () {
    const btnClass = {
      backgroundColor: '#66bd68',
      margin: 10,
      width: '100%',
      padding: 10,
      justifyContent: 'center',
      alignItems: 'center'
    }

    return (
      <Container>
        <Text>{this.state.latitude} {this.state.longitude}</Text>

        {
          this.state.businesses.length
            ? (
              <ScrollContainer>
                {
                  this.state.businesses.map((place, index) => {
                    const uri = place.image_url === '' ? this.state.businesses[index - 1].photo_url : place.photo_url

                    return (
                      <Item
                        onPress={() => this.visit(place)}
                        key={place.name}
                      >
                        <View style={{ flex: 1 }}>
                          <Preview source={{ uri }} />
                          <BlurView tint='dark' intensity={90} style={StyleSheet.absoluteFill}>
                            <Info>
                              <Title>{place.name}</Title>
                              <Subtitle>{place.review_count} reviews</Subtitle>
                              {/* <Subtitle>{kmToM(place.distance / 1000).toFixed(0)} miles away</Subtitle> */}
                            </Info>
                          </BlurView>
                        </View>
                      </Item>
                    )
                  })
                }
              </ScrollContainer>
            )
          : null
        }

       {this.state.businesses.length === 0 ? <Button onPress={this.getLocationAsync} title='Locate' /> : null}
      </Container>
    )
  }
}

const Preview = styled.Image`
  width: 100%;
  height: 160px;
`

const Container = styled.View`
  flex: 1;
  background-color: #fff;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding-top: 40px;
`

const Item = styled.TouchableOpacity`
  width: 100%;
  display: flex;
  flex-direction: row;
  position: relative;
  shadow-color: #000;
  shadow-offset: {width: 0, height: 10};
  shadow-opacity: 0.1;
`

const Row = styled.View`
  display: flex;
  flex-direction: row;
  padding-bottom: 16px;
`

const Info = styled.View`
  margin-left: 16px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex: 1;
`

const Title = styled.Text`
  color: white;
  font-weight: 900;
  font-size: 32px;
  shadow-color: #000;
  shadow-offset: 5px 0px;
  shadow-opacity: 0.25;
  shadow-radius: 10;
`

const Subtitle = styled.Text`
  color: white;
  font-weight: bold;
  font-size: 18px;
  shadow-offset: 5px 0px;
  shadow-opacity: 0.25;
  shadow-radius: 10;
`

const ScrollContainer = styled.ScrollView`
  flex: 1;
  width: 100%;
`
