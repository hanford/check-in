import React from 'react'
import styled from 'styled-components/native'
import kmToM from 'km-m'
import sortOn from 'sort-on'

import { yelp } from './config'
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
    console.log(place)
  }

  getBusinesses = async () => {
    let body = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${yelp}`
      }
    }

    const res = await fetch(`https://api.yelp.com/v3/businesses/search?latitude=${this.state.latitude}&longitude=${this.state.longitude}`, body)
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
                    const uri = place.image_url === '' ? this.state.businesses[index - 1].image_url : place.image_url

                    return (
                      <Item
                        onPress={() => this.visit(place)}
                        key={place.name}
                      >
                        <View style={{ flex: 1 }}>
                          <Preview source={{ uri }} />
                          <BlurView tint='dark' intensity={95} style={StyleSheet.absoluteFill}>
                            <Info>
                              <Title>{place.name}</Title>
                              <Subtitle>{place.review_count} reviews</Subtitle>
                              <Subtitle>{kmToM(place.distance / 1000).toFixed(0)} miles away</Subtitle>
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
